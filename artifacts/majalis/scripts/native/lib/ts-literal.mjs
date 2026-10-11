/**
 * يستخرج ثابتًا علويًا (const NAME = <literal>) من ملف TS/TSX حرفيًا عبر AST دون تنفيذ شيفرة الملف.
 * المقبول: كائنات/مصفوفات/نصوص/قوالب بلا استبدال/أرقام/منطقية/null، `as`/`satisfies`، جمع نصوص، مراجع لثوابت علوية أخرى في الملف، spread لها.
 * أي تعبير غير ذلك يرمي خطأً (لا تخمين ولا إعادة صياغة).
 */
import fs from "node:fs";
import ts from "typescript";

export function loadConsts(file) {
  const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const decls = new Map();
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name) && d.initializer) decls.set(d.name.text, d.initializer);
  }
  const cache = new Map();
  const ev = (n) => {
    if (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isNonNullExpression(n)) return ev(n.expression);
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
    if (ts.isNumericLiteral(n)) return Number(n.text);
    if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (n.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isPrefixUnaryExpression(n) && n.operator === ts.SyntaxKind.MinusToken) return -ev(n.operand);
    if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.PlusToken) return ev(n.left) + ev(n.right);
    if (ts.isIdentifier(n)) {
      if (!decls.has(n.text)) throw new Error(`مرجع غير معروف: ${n.text}`);
      if (!cache.has(n.text)) cache.set(n.text, ev(decls.get(n.text)));
      return cache.get(n.text);
    }
    if (ts.isArrayLiteralExpression(n)) return n.elements.flatMap((e) => (ts.isSpreadElement(e) ? ev(e.expression) : [ev(e)]));
    if (ts.isObjectLiteralExpression(n)) {
      const o = {};
      for (const p of n.properties) {
        if (ts.isSpreadAssignment(p)) { Object.assign(o, ev(p.expression)); continue; }
        if (!ts.isPropertyAssignment(p) && !ts.isShorthandPropertyAssignment(p)) throw new Error(`خاصية غير مدعومة في ${file}`);
        const k = ts.isShorthandPropertyAssignment(p) ? p.name.text : ts.isIdentifier(p.name) || ts.isStringLiteral(p.name) || ts.isNumericLiteral(p.name) ? p.name.text : null;
        if (k == null) throw new Error(`مفتاح محسوب غير مدعوم في ${file}`);
        o[k] = ts.isShorthandPropertyAssignment(p) ? ev(p.name) : ev(p.initializer);
      }
      return o;
    }
    throw new Error(`تعبير غير حرفي (${ts.SyntaxKind[n.kind]}) في ${file}: ${n.getText().slice(0, 60)}`);
  };
  const get = (name) => {
    if (!decls.has(name)) throw new Error(`الثابت ${name} غير موجود في ${file}`);
    return ev(decls.get(name));
  };
  get.sf = sf;
  get.ev = ev;
  return get;
}

/** كل كائن حرفي (في أي عمق) يحوي المفاتيح المطلوبة كلها، بترتيب ظهوره، مقتصرًا على تلك المفاتيح (تُقيَّم حرفيًا وإلا خطأ). */
export function objectsWithKeys(file, keys) {
  const get = loadConsts(file);
  const out = [];
  const visit = (n) => {
    if (ts.isObjectLiteralExpression(n)) {
      const props = new Map(n.properties.filter((p) => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))).map((p) => [p.name.text, p.initializer]));
      if (keys.every((k) => props.has(k))) { out.push(Object.fromEntries(keys.map((k) => [k, get.ev(props.get(k))]))); return; }
    }
    ts.forEachChild(n, visit);
  };
  visit(get.sf);
  return out;
}

/** نص JSX مجمَّع (JsxText + حرفيات نصية في {}) بمسافات مطبَّعة. */
export function jsxText(n) {
  if (ts.isJsxText(n)) return n.text;
  if (ts.isJsxExpression(n)) return n.expression && (ts.isStringLiteral(n.expression) || ts.isNoSubstitutionTemplateLiteral(n.expression)) ? n.expression.text : "";
  if (ts.isJsxElement(n)) return n.children.map(jsxText).join("");
  return "";
}

export { ts };
