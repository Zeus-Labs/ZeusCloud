import { classNames } from '../../utils/utils'

/*const tabs = [
    { name: 'My Account', href: '#', current: false },
    { name: 'Company', href: '#', current: false },
    { name: 'Team Members', href: '#', current: true },
    { name: 'Billing', href: '#', current: false },
]*/
  

export interface TabsProps   {
    tabs: {
        name: string,
        body: React.ReactNode
    }[],
    current: string,
    setCurrent: (c: string) => void
};


export default function Tabs(props: TabsProps) {
    const {
        tabs, current, setCurrent,
    } = props;
    const curTab = tabs.filter(({ name }) => name === current)[0];
    return (
        <div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.name}
                            type="button"
                            onClick={() => setCurrent(tab.name)}
                            className={classNames(
                                tab.name === current
                                    ? 'border-indigo-500 text-indigo-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
                            )}
                            aria-current={tab.name === current ? 'page' : undefined}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            {curTab && curTab.body}
        </div>
    )
}
