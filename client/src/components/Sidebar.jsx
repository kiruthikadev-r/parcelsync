import { NavLink } from "react-router-dom";

export default function Sidebar({ title, links }) {
  return (
    <>
      <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-6 md:flex">
        <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</div>
        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {link.icon && <span className="text-base leading-none">{link.icon}</span>}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
