// مصدر وحيد لعنوان الدعم. التبديل لاحقًا = تعديل السطر التالي فقط.
// العنوان الرسمي بقرار يوسف؛ يطابق AccountTexts.contactEmail في التطبيق.
window.SUPPORT_EMAIL = "info@ssunnah.com";
(function () {
  var e = window.SUPPORT_EMAIL, ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);
  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-support-email]").forEach(function (n) {
      if (ok) { n.textContent = e; n.setAttribute("href", "mailto:" + e); }
      else { n.removeAttribute("href"); n.textContent = n.lang === "en" || n.closest("[lang=en]") ? "(support address coming soon)" : "(عنوان الدعم قيد الإضافة)"; }
    });
  });
})();
