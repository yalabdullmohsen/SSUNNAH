// مصدر وحيد لعنوان الدعم. التبديل لاحقًا = تعديل السطر التالي فقط.
// فارغ = لم يُحدَّد بعد (لا يُنشر أي عنوان لا يصل). المعتمد من يوسف فقط.
window.SUPPORT_EMAIL = "";
(function () {
  var e = window.SUPPORT_EMAIL, ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-support-email]").forEach(function (n) {
      if (ok) { n.textContent = e; n.setAttribute("href", "mailto:" + e); }
      else { n.removeAttribute("href"); n.textContent = n.lang === "en" || n.closest("[lang=en]") ? "(support address coming soon)" : "(عنوان الدعم قيد الإضافة)"; }
    });
  });
})();
