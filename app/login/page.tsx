import { getTranslations } from "next-intl/server";
import { LoginClient } from "./LoginClient";

export default async function LoginPage() {
  const t = await getTranslations("authLogin");
  const tCommon = await getTranslations("common");
  const tLang = await getTranslations("language");

  return (
    <LoginClient
      languageLabels={{
        csLabel: tLang("csLabel"),
        enLabel: tLang("enLabel"),
        switchToCs: tLang("switchTo", { language: tLang("czech") }),
        switchToEn: tLang("switchTo", { language: tLang("english") }),
      }}
      labels={{
        eyebrow: t("eyebrow"),
        brand: t("brand", { brandName: tCommon("brandName") }),
        brandName: tCommon("brandName"),
        title: t("title"),
        subtitle: t("subtitle"),
        secureTitle: t("secureTitle"),
        secureBody: t("secureBody"),
        codeHint: t("codeHint"),
        emailLabel: t("emailLabel"),
        emailPlaceholder: t("emailPlaceholder"),
        codeLabel: t("codeLabel"),
        sendCode: t("sendCode"),
        verify: t("verify"),
        sendingCode: t("sendingCode"),
        verifying: t("verifying"),
        cancel: t("cancel"),
        boostHint: t("boostHint"),
        termsPrefix: t("termsPrefix"),
        termsLink: t("termsLink"),
        termsSuffix: t("termsSuffix"),
        errorInvalidCode: t("errorInvalidCode"),
        errorExpired: t("errorExpired"),
        errorRateLimited: t("errorRateLimited"),
        errorTooManyAttempts: t("errorTooManyAttempts"),
        errorInvalidRequest: t("errorInvalidRequest"),
      }}
    />
  );
}
