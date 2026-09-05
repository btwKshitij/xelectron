"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { authClient } from "@/lib/auth-client"
import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const user = {
    name: session?.user?.name ?? "Xelectron Admin",
    email: session?.user?.email ?? "admin@xelectron.com",
    avatar: "",
  }
  const initials = user.name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleSignOut() {
    setIsSigningOut(true)
    await authClient.signOut()
    router.replace("/login")
    router.refresh()
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-black/5">
          <Link
            href="/dashboard/profile"
            className="flex flex-1 items-center gap-2.5 min-w-0 group"
            title="Edit Profile"
          >
            <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg bg-[#1a1a1a] text-white text-xs font-semibold shadow-2xs group-hover:ring-2 group-hover:ring-[#0a7ae6] transition-all">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="size-full rounded-lg object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-[13px] font-semibold text-[#1a1a1a] group-hover:text-[#0a7ae6] transition-colors">
                {user.name}
              </span>
              <span className="mt-0.5 truncate text-[11px] font-normal text-[#707070]">{user.email}</span>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            title="Edit Profile"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white text-black/60 shadow-2xs hover:bg-slate-100 hover:text-black transition-all cursor-pointer group-data-[collapsible=icon]:hidden"
          >
            <UserIcon className="size-3.5" />
          </Link>

          <AlertDialog>
            <AlertDialogTrigger
              disabled={isSigningOut}
              title="Log out"
              aria-label="Log out"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white text-black/60 shadow-2xs hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer group-data-[collapsible=icon]:hidden"
            >
              <LogOutIcon className="size-3.5" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You will be signed out of your account and redirected to the login page.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void handleSignOut()}>
                  Log out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
