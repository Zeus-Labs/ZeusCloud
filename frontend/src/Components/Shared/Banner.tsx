
type BannerProps = {
    bannerHeader: string, 
    bannerDescription: string,
};

const Banner = ({bannerHeader, bannerDescription}: BannerProps) => {
    return (
    <div className="bg-white shadow-sm flex flex-row justify-start items-end">
        <div className="py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg font-semibold leading-6 text-gray-900">{bannerHeader}</h1>
        </div>
        <span className="inline-flex py-4 sm:px-6 lg:px-8 text-sm">
                {bannerDescription}
        </span>
    </div>)
}

export {Banner};