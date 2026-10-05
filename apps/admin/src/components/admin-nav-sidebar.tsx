'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { AdminNavGroup, AdminNavItem } from '@/components/admin-nav-config';

function groupHrefs(group: AdminNavGroup): string[] {
  return [
    ...group.items.map((item) => item.href),
    ...(group.sections ?? []).flatMap((section) => section.items.map((item) => item.href)),
  ];
}

function isActive(pathname: string, href: string, hrefs: string[]): boolean {
  if (href === '/') return pathname === '/';
  const matches = pathname === href || pathname.startsWith(`${href}/`);
  if (!matches) return false;
  return !hrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );
}

function groupIsActive(group: AdminNavGroup, pathname: string): boolean {
  const hrefs = groupHrefs(group);
  return hrefs.some((href) => isActive(pathname, href, hrefs));
}

const linkClass = (active: boolean) =>
  `block rounded-md px-3 py-1.5 text-sm transition ${
    active
      ? 'bg-[var(--varnarc-muted)] font-medium text-[var(--varnarc-brand)]'
      : 'text-[var(--varnarc-subtle)] hover:bg-[var(--varnarc-muted)] hover:text-[var(--varnarc-ink)]'
  }`;

function NavLinks({
  items,
  hrefs,
  pathname,
}: {
  items: AdminNavItem[];
  hrefs: string[];
  pathname: string;
}) {
  return (
    <>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={linkClass(isActive(pathname, item.href, hrefs))}
        >
          {item.label}
        </Link>
      ))}
    </>
  );
}

export function AdminNavSidebar({ groups }: { groups: AdminNavGroup[] }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      for (const group of groups) {
        const hrefs = groupHrefs(group);
        const active = groupIsActive(group, pathname);
        if (active) next[group.id] = true;
        const activeSection = (group.sections ?? []).find((section) =>
          section.items.some((item) => isActive(pathname, item.href, hrefs)),
        );
        if (!activeSection) continue;
        for (const section of group.sections ?? []) {
          next[section.id] = section.id === activeSection.id;
        }
      }
      return next;
    });
  }, [pathname, groups]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const opening = !prev[id];
      const next = { ...prev, [id]: opening };
      if (!opening) return next;

      const groupIds = groups.map((group) => group.id);
      if (groupIds.includes(id)) {
        for (const groupId of groupIds) {
          if (groupId !== id) next[groupId] = false;
        }
        return next;
      }

      for (const group of groups) {
        const sectionIds = (group.sections ?? []).map((section) => section.id);
        if (!sectionIds.includes(id)) continue;
        for (const sectionId of sectionIds) {
          if (sectionId !== id) next[sectionId] = false;
        }
      }
      return next;
    });
  };

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-[var(--varnarc-border)] bg-[var(--varnarc-surface)] md:block">
      <nav className="flex flex-col gap-0.5 p-3" aria-label="Admin navigation">
        {groups.map((group) => {
          const isDashboardOnly =
            group.id === 'overview' && group.items.length === 1 && !group.sections?.length;
          const dashboardItem = group.items[0];
          const hrefs = groupHrefs(group);

          if (isDashboardOnly && dashboardItem) {
            return (
              <Link
                key={dashboardItem.href}
                href={dashboardItem.href}
                className={`${linkClass(isActive(pathname, dashboardItem.href, hrefs))} py-2`}
              >
                {dashboardItem.label}
              </Link>
            );
          }

          const open = expanded[group.id] ?? false;
          const activeGroup = groupIsActive(group, pathname);

          return (
            <div key={group.id} className="py-0.5">
              <button
                type="button"
                onClick={() => toggle(group.id)}
                aria-expanded={open}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                  activeGroup
                    ? 'text-[var(--varnarc-brand)]'
                    : 'text-[var(--varnarc-ink)] hover:bg-[var(--varnarc-muted)]'
                }`}
              >
                <span>{group.label}</span>
                <span className="text-xs text-[var(--varnarc-subtle)]" aria-hidden>
                  {open ? '▾' : '▸'}
                </span>
              </button>
              {open ? (
                <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l border-[var(--varnarc-border)] pl-2">
                  <NavLinks items={group.items} hrefs={hrefs} pathname={pathname} />
                  {group.sections?.map((section) => {
                    const sectionOpen = expanded[section.id] ?? false;
                    const sectionActive = section.items.some((item) =>
                      isActive(pathname, item.href, hrefs),
                    );
                    return (
                      <div key={section.id} className="py-0.5">
                        <button
                          type="button"
                          onClick={() => toggle(section.id)}
                          aria-expanded={sectionOpen}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-xs font-semibold tracking-wide uppercase transition ${
                            sectionActive
                              ? 'text-[var(--varnarc-brand)]'
                              : 'text-[var(--varnarc-subtle)] hover:bg-[var(--varnarc-muted)] hover:text-[var(--varnarc-ink)]'
                          }`}
                        >
                          <span>{section.label}</span>
                          <span aria-hidden>{sectionOpen ? '▾' : '▸'}</span>
                        </button>
                        {sectionOpen ? (
                          <div className="ml-2 flex flex-col gap-0.5 border-l border-[var(--varnarc-border)] pl-2">
                            <NavLinks items={section.items} hrefs={hrefs} pathname={pathname} />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
