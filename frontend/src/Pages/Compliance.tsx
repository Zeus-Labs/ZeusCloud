import { Banner } from '../Components/Shared/Banner';
import { DocumentTextIcon } from '@heroicons/react/20/solid'
import { useEffect, useState } from 'react';
import { getComplianceFrameworkStats } from '../Components/Compliance/ComplianceApi'; 
import { ComplianceFrameworkStats } from '../Components/Compliance/ComplianceTypes';


export interface ComplianceCardProps {
  name: string;
  version: string;
  environment: string;
  frameworkId: string;
}

const ComplianceCardList = [
  // {
  //   name: 'SOC 2',
  //   version: ' ',
  //   environment: 'AWS',
  //   email: 'janecooper@example.com',
  //   frameworkId: 'soc2',
  // },
  {
    name: 'PCI DSS',
    version: 'v3.2.1',
    environment: 'AWS',
    frameworkId: 'pci_dss_3_2_1',
  },
  {
    name: 'CIS',
    version: 'v1.2',
    environment: 'AWS',
    frameworkId: 'cis_1_2_0',    
  },
  {
    name: 'CIS',
    version: 'v1.3',
    environment: 'AWS',
    frameworkId: 'cis_1_3_0',    
  },
  {
    name: 'CIS',
    version: 'v1.4',
    environment: 'AWS',
    frameworkId: 'cis_1_4_0',  
  },
  {
    name: 'CIS',
    version: 'v1.5',
    environment: 'AWS',
    frameworkId: 'cis_1_5_0',  
  },
]

const Compliance = () => {
    return (
      <div className="min-h-full">
        <Banner bannerHeader='Compliance' bannerDescription='Shows controls for compliance standards.' />
        
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9">
          <div className="mx-auto w-11/12">
            <ComplianceCardsComp/>
            
          </div>
        </div>

      </div>
    );
  }
  

const ComplianceCard = (complianceCard: ComplianceCardProps) => {

  // State to track open/close state of every row.
  var initComplianceFrameworkStats: ComplianceFrameworkStats= {
      framework_name: '',
      rule_passing_percentage: 0,
      loading: true,
  };
  const [compFrameworkStats, setCompFrameworkStats] = useState(initComplianceFrameworkStats);

   useEffect(() => {
    getComplianceFrameworkStats(complianceCard.frameworkId, setCompFrameworkStats);
  }, [complianceCard.frameworkId]);
  
  return (
      <li key={complianceCard.frameworkId} className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow">
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            
            <div className="flex-1 truncate">
              <div className="flex items-end space-x-3">
                <h3 className="truncate text-2xl font-medium text-gray-900">{complianceCard.name}</h3>
                <span className="inline-block flex-shrink-0 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                  {complianceCard.environment}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">{complianceCard.version}</p>
            </div>

         
            <div key={complianceCard.name} className="flex flex-col overflow-hidden items-center rounded-lg bg-white px-4 py-5 shadow sm:p-6">
                <dt className="truncate text-sm font-medium text-gray-500">Completed</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{
                  compFrameworkStats.rule_passing_percentage.toString()+"%"}</dd>
            </div>
          </div>

          <div>
            <div className="-mt-px flex divide-x divide-gray-200">

              <div className="flex w-0 flex-1">
                <a
                  href={'/compliance/report/' + complianceCard.frameworkId}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  <span className="ml-3">Details</span>
                </a>
              </div>
            </div>
          </div>

      </li>
  )
}

  function ComplianceCardsComp() {
    return (
    <ul role="list" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ComplianceCardList.map((complianceCard) => {
        return (
          <ComplianceCard key={complianceCard.frameworkId} {...complianceCard}/>
        )})}
    </ul>);
  }

  export default Compliance;
  