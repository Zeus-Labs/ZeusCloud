import './Nav.css';
import { NavLink } from 'react-router-dom';

const navigation = [
  { name: 'Rules', href: '/rules', current: false },
  { name: 'Alerts', href: '/alerts', current: true },
  { name: 'Compliance', href: '/compliance', current: false },
  { name: 'Settings', href: '/settings', current: false },
]

const Nav = () => {

  return (
    <nav className="bg-gray-800">
        <>
          <div className="max-w-8xl mx-auto px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-start">
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <a href='/alerts' className="text-xl text-white font-semibold">IronCloud</a>
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => isActive
                              ? "bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        }
                        aria-current={item.current ? 'page' : undefined}
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </>
    </nav>
  )
}

export default Nav;
