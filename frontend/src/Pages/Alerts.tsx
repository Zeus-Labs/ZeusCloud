import {Banner} from '../Components/Shared/Banner';
import {AlertsTableOps} from '../Components/Alerts/AlertsTableOps';

const Alerts = () => {

    return (
      <div className="min-h-full">
          <Banner bannerHeader='Alerts' bannerDescription='Investigate failing findings for your active ZeusCloud rules.' />
          <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9">
            <AlertsTableOps/>
          </div>
      </div>
    );
  }
  
export default Alerts;
  