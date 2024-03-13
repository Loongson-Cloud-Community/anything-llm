import Sidebar from "@/components/SettingsSidebar";
// import FooterCustomization from "./FooterCustomization";
// import SupportEmail from "./SupportEmail";
// import CustomLogo from "./CustomLogo";
import CustomMessages from "./CustomMessages";

export default function Appearance() {
  return (
    <div
      style={{ height: "calc(100vh - 40px)" }}
      className="w-screen overflow-hidden bg-sidebar flex"
    >
      <Sidebar />
      <div className="transition-all duration-500 relative ml-[2px] mr-[16px] my-[16px] md:rounded-[26px] bg-main-gradient w-full h-[93vh] overflow-y-scroll border-4 border-accent">
        <div className="flex flex-col w-full px-1 md:pl-6 md:pr-[86px] md:py-6 py-16">
          <div className="w-full flex flex-col gap-y-1 pb-6 border-white border-b-2 border-opacity-10">
            <div className="items-center">
              <p className="text-lg leading-6 font-bold text-white">
                Appearance
              </p>
            </div>
            <p className="text-xs leading-[18px] font-base text-white text-opacity-60">
              Customize the appearance settings of your platform.
            </p>
          </div>
          {/* <CustomLogo /> */}
          <CustomMessages />
          {/* <FooterCustomization />
          <SupportEmail /> */}
        </div>
      </div>
    </div>
  );
}
