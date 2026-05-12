const HOME_DETAIL_BACK_LABELS = ["gündeme dön", "back to home"];

function normalizeHomeDetailText(value = "") {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ")
    .trim();
}

function compactHomeLogoText(value = "") {
  return normalizeHomeDetailText(value).replace(/\s+/g, "");
}

function isHomeLogoTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  const logo = target.closest<HTMLElement>("nav [class*='cursor-pointer']");
  return Boolean(logo && compactHomeLogoText(logo.textContent || "") === "sonarat");
}

function clearOpenArticleDetail() {
  const backControl = [...document.querySelectorAll<HTMLElement>("button, a")].find((control) => {
    const label = normalizeHomeDetailText(control.textContent || "");
    return HOME_DETAIL_BACK_LABELS.some((candidate) => label.includes(normalizeHomeDetailText(candidate)));
  });

  backControl?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
}

if (typeof window !== "undefined") {
  document.addEventListener(
    "click",
    (event) => {
      if (isHomeLogoTarget(event.target)) clearOpenArticleDetail();
    },
    true,
  );
}

export {};
