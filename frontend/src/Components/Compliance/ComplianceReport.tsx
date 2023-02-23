import {Banner} from '../Shared/Banner';
import { useParams } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid'
import ComplianceTableOps from './ComplianceTableOps';


const ComplianceReport = () => {

    const { frameworkId } = useParams();
    var report: string = "" ; 
    if(frameworkId !== undefined) {
      if(frameworkId === 'pci_dss_3_2_1') {
        report = 'PCI DSS v3.2.1';
      } else if(frameworkId === 'cis_1_2_0') {
        report = 'CIS 1.2.0';
      } else if(frameworkId === 'cis_1_3_0') {
        report = 'CIS 1.3.0';
      } else if(frameworkId === 'cis_1_4_0') {
        report = 'CIS 1.4.0';
      } else if(frameworkId === 'cis_1_5_0') {
        report = 'CIS 1.5.0';
      }
    } else {
      return <></>
    }
    
    return (
      <div className="min-h-full">
        <Banner bannerHeader='Compliance' bannerDescription='Shows controls for compliance standards.' />
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9">
          <div className="mx-auto w-11/12">

            <div className="flex flex-row items-center mb-4">
              <a href="/compliance">
                <span className="inline-flex rounded-full bg-indigo-100 px-2 text-base font-semibold leading-5 text-indigo-800">
                    Compliance Summary
                </span>
              </a>
              <ChevronRightIcon className="h-6 w-6 text-gray-400"/>
              <span className="inline-flex rounded-full bg-indigo-100 px-2 text-base font-semibold leading-5 text-indigo-800">
                  {report} Report
              </span>
            </div>

            {/* Produce all the compliance control tables. */}
            {
              (frameworkId ? <ComplianceTableOps 
                reportType={frameworkId}
              /> : <></>)
            }
            
          </div>
        </div>
      </div>
    );
  }


export default ComplianceReport;
