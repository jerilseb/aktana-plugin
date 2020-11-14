document.addEventListener("DOMContentLoaded", function() {
  // document.querySelector("#config").addEventListener("click", function() {
  //   window.open(chrome.runtime.getURL("options.html"));
  // });

  document.querySelector("#feedback").addEventListener("click", function() {
    window.open("https://videoken.com/contact");
  });

  // document.querySelector("#about").addEventListener("click", function() {
  //   window.open("https://videoken.com");
  // });

  // checkbox = document.querySelector("#tooltip-toggle");
  // chrome.storage.local.get("hintDisabled", s => {
  //   checkbox.checked = !s.hintDisabled;
  // });

  // checkbox.addEventListener("change", function() {
  //   chrome.storage.local.set({ hintDisabled: !this.checked });
  // });
});