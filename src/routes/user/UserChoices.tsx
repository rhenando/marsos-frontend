import React, { useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/base/button";
import { useTranslation } from "react-i18next";

export default function UserChoices() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { locale } = useParams();
  const [searchParams] = useSearchParams();

  const countryCode = searchParams.get("countryCode") ?? "+966";
  const phone = searchParams.get("phone") ?? "";
  const fullPhone = `${countryCode}${phone}`;
  const [loadingRole, setLoadingRole] = useState(null);

  const isRtl = i18n.language === "ar";

  const choose = (role) => {
    setLoadingRole(role);
    setTimeout(() => {
      if (role === "supplier") {
        navigate(
          `/${locale}/supplier-onboarding?phone=${encodeURIComponent(
            fullPhone
          )}`
        );
      } else {
        navigate(
          `/${locale}/buyer-onboarding?countryCode=${encodeURIComponent(
            countryCode
          )}&phone=${encodeURIComponent(phone)}`
        );
      }
    }, 500);
  };

  return (
    <div className='lg:grid lg:grid-cols-2 min-h-[86vh] items-center'>
      {/* Left Column */}
      <div
        className='bg-gray-50 px-4 sm:px-6 lg:px-8 h-full flex items-center justify-center'
        dir={isRtl ? "rtl" : "ltr"}
      >
        <Card className='w-full max-w-md bg-white shadow-lg rounded-lg'>
          <CardContent className='px-6 py-8 space-y-6'>
            <h2 className='text-xl sm:text-2xl font-extrabold text-gray-900 text-center'>
              {t("user-choice.login.chooseRole", "Choose your role")}
            </h2>
            <p className='text-sm text-gray-600 text-center'>
              {t(
                "user-choice.login.desc.chooseRole",
                "Please select your role to continue."
              )}
            </p>

            <div className='flex gap-4'>
              <Button
                variant='outline'
                onClick={() => choose("buyer")}
                disabled={loadingRole !== null}
                className='flex-1 py-3 text-sm font-medium'
              >
                {loadingRole === "buyer"
                  ? t("user-choice.login.buttons.loading", "Loading...")
                  : t("user-choice.login.roles.buyer", "Buyer")}
              </Button>

              <Button
                variant='outline'
                onClick={() => choose("supplier")}
                disabled={loadingRole !== null}
                className='flex-1 py-3 text-sm font-medium'
              >
                {loadingRole === "supplier"
                  ? t("user-choice.login.buttons.loading", "Loading...")
                  : t("user-choice.login.roles.supplier", "Supplier")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className='hidden lg:flex h-full bg-gradient-to-br from-[#2c6449] to-green-400 text-white flex-col items-center justify-center p-10'>
        <img src='/logo.svg' alt='Marsos Logo' className='w-28 mb-4' />
        <h1 className='text-4xl font-bold mb-4'>
          {t("user-choice.login.welcome.title", "Welcome to Marsos")}
        </h1>
        <p className='text-lg max-w-sm text-center opacity-80'>
          {t(
            "user-choice.login.welcome.subtitle",
            "Choose your path to get started."
          )}
        </p>
      </div>
    </div>
  );
}
