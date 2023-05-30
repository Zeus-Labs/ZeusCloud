import { AlertSlideoverProps } from "./AlertsTypes";
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Risks } from '../Shared/Risks'
import { Remediate } from '../Remediation/Remediate'
import RuleGraph from "./RuleGraph";
import ColoredBgSpan from "../Shared/ColoredBgSpan";
import { severityColorMap } from "./AlertsTableOps";

export const AlertSlideover = (
    { slideoverData, setOpen }: AlertSlideoverProps) => {
    const open = slideoverData.open;

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                                                    <Dialog.Title className="text-lg font-medium text-white">{slideoverData.rule_data.description}</Dialog.Title>
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-indigo-700 text-indigo-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                                                            onClick={() => setOpen()}
                                                        >
                                                            <span className="sr-only">Close panel</span>
                                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <p className="text-sm text-indigo-300">
                                                        {"Resource Id: " + slideoverData.alert_instance.resource_id}
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
                                                                <span className="block w-full">
                                                                    {slideoverData.alert_instance.context}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="max-w-full flex flex-row grid grid-cols-3 gap-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-400">Severity</span>
                                                                <span className="text-base font-normal">
                                                                    <ColoredBgSpan 
                                                                        value={slideoverData.rule_data.severity}
                                                                        bgColor={severityColorMap[slideoverData.rule_data.severity]}
                                                                        textColor={severityColorMap[slideoverData.rule_data.severity]} 
                                                                    />
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-gray-400 mb-1">Risks</span>
                                                                <Risks values={slideoverData.rule_data.risk_categories} />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label htmlFor="remediation" className="block text-base font-medium text-gray-900">
                                                                Remediation
                                                            </label>
                                                            <div className="mt-1">
                                                                {/* <span>
                                                    Follow the remediation instructions of the Ensure IAM policies are attached only to
                                                    groups or roles recommendation
                                                    </span> */}
                                                                <Remediate rule_data={slideoverData.rule_data} />
                                                            </div>
                                                        </div>
                                                        <RuleGraph ruleGraph={slideoverData.display_graph} />
                                                    </div>
                                                    <div className="pt-4 pb-6">

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
