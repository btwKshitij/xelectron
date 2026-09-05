"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon, CornerDownRight } from "lucide-react"

function isRouteActive(pathname: string, url: string) {
  if (url === "#") return false
  if (url === "/dashboard") return pathname === url
  return pathname === url || pathname.startsWith(`${url}/`)
}

function NavMainItem({
  item,
  pathname,
}: {
  item: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }
  pathname: string
}) {
  const routeActive =
    item.isActive ||
    isRouteActive(pathname, item.url) ||
    item.items?.some((subItem) => isRouteActive(pathname, subItem.url)) ||
    false
  const [open, setOpen] = React.useState(routeActive)

  React.useEffect(() => {
    setOpen(routeActive)
  }, [routeActive])
  const [hoveredSubIndex, setHoveredSubIndex] = React.useState<number | null>(null)

  if (item.items?.length) {
    return (
      <Collapsible
        key={item.title}
        asChild
        open={open}
        onOpenChange={setOpen}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <SidebarMenuButton isActive={routeActive} tooltip={item.title}>
            <Link prefetch={false}
              href={item.url}
              data-active={routeActive}
              className={`flex flex-row items-center gap-2.5 w-full h-8 px-2.5 text-[13px] rounded-lg transition-all ${
                routeActive
                  ? "bg-white text-[#1a1a1a] font-semibold shadow-xs"
                  : "text-[#303030] hover:bg-black/5 hover:text-[#1a1a1a] font-medium"
              }`}
            >
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
          <CollapsibleContent>
            <SidebarMenuSub className="my-1 flex flex-col gap-1 border-l-0 pl-3.5 pr-1">
              {item.items.map((subItem) => {
                const isSubActive = isRouteActive(pathname, subItem.url)
                return (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton isActive={isSubActive}>
                      <Link prefetch={false}
                        href={subItem.url}
                        className={`group/sub flex items-center gap-2 h-8 px-2 text-[13px] rounded-lg transition-all ${
                          isSubActive
                            ? "bg-black/[0.05] font-medium text-[#1a1a1a]"
                            : "text-[#555555] hover:text-[#1a1a1a] hover:bg-black/[0.04] font-normal"
                        }`}
                      >
                        <CornerDownRight className={`size-3.5 text-black/40 shrink-0 transition-opacity ${
                          isSubActive ? "opacity-100" : "opacity-0 group-hover/sub:opacity-100"
                        }`} />
                        <span>{subItem.title}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={routeActive} tooltip={item.title}>
        <Link prefetch={false}
          href={item.url}
          data-active={routeActive}
          className={`flex flex-row items-center gap-2.5 w-full h-8 px-2.5 text-[13px] rounded-lg transition-all ${
            routeActive
              ? "bg-white text-[#1a1a1a] font-semibold shadow-xs"
              : "text-[#303030] hover:bg-black/5 hover:text-[#1a1a1a] font-medium"
          }`}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainItem key={`${item.title}-${pathname}`} item={item} pathname={pathname} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
