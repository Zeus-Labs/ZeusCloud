import { useContext } from "react";
import { UserContext } from "../../App";

type BannerProps = {
    bannerHeader: string,
    bannerDescription: string,
};

const Banner = ({ bannerHeader, bannerDescription }: BannerProps) => {
    const userEmail = useContext(UserContext)
    return (
        <div className="bg-white shadow-sm flex flex-row justify-between items-end">
            <div className="flex items-end">
                <div className="py-4 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-lg font-semibold leading-6 text-gray-900">{bannerHeader}</h1>
                </div>
                <span className="inline-flex py-4 sm:px-6 lg:px-8 text-sm">
                    {bannerDescription}
                </span>
            </div>
            {
                userEmail && userEmail !== "" 
                &&
                <div className="py-4 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-md leading-6 text-gray-900">{userEmail}</h2>
                </div>
            }

        </div>)
}

export { Banner };