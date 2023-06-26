import { AlertSlideoverProps, DisplayGraph, alert_instance, rulealerts_group } from "./AlertsTypes";
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Risks } from '../Shared/Risks'
import { Remediate } from '../Remediation/Remediate'
import RuleGraph from "./RuleGraph";
import ColoredBgSpan from "../Shared/ColoredBgSpan";
import { severityColorMap } from "./AlertsTableOps";
import { useNavigate} from "react-router-dom";
import axios from "axios";
import yaml from 'js-yaml';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { agate } from 'react-syntax-highlighter/dist/esm/styles/hljs';

async function getRuleGraph(resource_id:string,rule_id:string){
    try {
        // @ts-ignore
        const ruleGraphEndpoint = window._env_.REACT_APP_API_DOMAIN + "/api/getRuleGraph";
        const response = await axios.get(ruleGraphEndpoint,
            { params: { resource_id: resource_id, rule_id: rule_id } }
        );
        
        return {
            rule_graph: response.data,
            error: ''
        };
    }
    catch (error) {
       
        let message = '';
        if (axios.isAxiosError(error)) {
            if (error.response && error.response.data) {
                message = "Error: " + error.response.data
            } else {
                message = "Oops! Encountered an error..."
            }
        } else {
            message = "Error in retrieving alerts information."
        }

        return {
            rule_graph: {},
            error: message,
        };
    }
}

export const AlertSlideover = (
    {selectedAlertInstance,selectedRuleAlertGroup,navigateOnSideBarClose,ruleCategory}: AlertSlideoverProps) => {
    const [isOpen,setIsOpen] = useState(true)
    const [displayGraph,setDisplayGraph] = useState<{rule_graph:DisplayGraph,error:string}>({
        rule_graph:{
            node_info: {},
            adjacency_list: {}
        },
        error:""
    })
    
    useEffect(()=>{
        async function setGraphOnLoad(){
            const ruleGraph = await getRuleGraph(selectedAlertInstance.resource_id,selectedRuleAlertGroup.rule_data.uid)
            setDisplayGraph(ruleGraph)
        }
   
        setGraphOnLoad()
    },[])

    const handleSideBarClose = ()=>{
        setIsOpen(false)
        navigateOnSideBarClose()
    }

    let yamlStr = ""
    if(ruleCategory==="vulnerability" && selectedRuleAlertGroup.rule_data.yaml_template){
        const yamlObj = yaml.load(selectedRuleAlertGroup.rule_data.yaml_template)
        yamlStr = yaml.dump(yamlObj, { indent: 2 });
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={handleSideBarClose}>
                <div className="fixed inset-0" />

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">

                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-3xl">
                                    <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                                        <div className="h-0 flex-1 overflow-y-auto">
                                            <div className="bg-indigo-700 py-6 px-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <Dialog.Title className="text-lg font-medium text-white">{selectedRuleAlertGroup.rule_data.description}</Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                            onClick={() => handleSideBarClose()}
                                                        >
                                                            <span className="sr-only">Close panel</span>
                                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-sm text-indigo-300">
                                                        {"Resource Id: " + selectedAlertInstance.resource_id}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-1 flex-col justify-between">
                                                <div className="divide-y divide-gray-200 px-4 sm:px-6">
                                                    <div className="space-y-6 pt-6 pb-5">
                                                        <div>
                                                            <label htmlFor="context" className="block text-m font-medium text-gray-900">
                                                                Context
                                                            </label>
                                                            <div className="mt-1">
                                                                <span className="block w-full whitespace-pre-line">
                                                                    {selectedAlertInstance.context}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="max-w-full flex flex-row grid grid-cols-3 gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-400">Severity</span>
                                                                <span className="text-base font-normal">
                                                                    <ColoredBgSpan 
                                                                        value={selectedRuleAlertGroup.rule_data.severity}
                                                                        bgColor={severityColorMap[selectedRuleAlertGroup.rule_data.severity]}
                                                                        textColor={severityColorMap[selectedRuleAlertGroup.rule_data.severity]} 
                                                                    />
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-400 mb-1">Risks</span>
                                                                <Risks values={selectedRuleAlertGroup.rule_data.risk_categories} />
                                                            </div>
                                                        </div>
                                                        {ruleCategory!=="vulnerability"
                                                        ?   <div>
                                                                <label htmlFor="remediation" className="block text-base font-medium text-gray-900">
                                                                    Remediation
                                                                </label>
                                                                <div className="mt-1">
                                                                    <Remediate rule_data={selectedRuleAlertGroup.rule_data} />
                                                                </div>
                                                            </div>
                                                        :   <div>
                                                                <label htmlFor="yamlTemplate" className="block text-base font-medium text-gray-900">
                                                                    CVE Template
                                                                </label>
                                                                <div className="mt-1">
                                                                <SyntaxHighlighter language="yaml" style={agate} customStyle={{backgroundColor: 'black', 
                                                                color: 'white',lineHeight:'28px',
                                                                borderRadius:"6px", padding:"1rem",maxHeight:"600px",overflow:"scroll"}}>
                                                                    {yamlStr}
                                                                </SyntaxHighlighter>
                                                                </div>
                                                            </div>
                                                        }
                                                        <RuleGraph ruleGraph={displayGraph.rule_graph} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>

                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
