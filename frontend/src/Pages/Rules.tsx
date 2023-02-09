import { Banner } from '../Components/Shared/Banner';
import {RulesTableOps} from '../Components/Rules/RulesTableOps';


const Rules = () => {
    
    return (
        <div className="min-h-full">
            <Banner bannerHeader='Rules' bannerDescription='Detect your risks in the cloud by configuring IronCloud rules.' />
            <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9">
                <RulesTableOps/>
            </div>
      </div>
    );
}

export default Rules;
