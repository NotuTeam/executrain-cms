/** @format */

"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

import { useGlobalState } from "@/lib/middleware";

import { MenuItem } from "@/interface/type";
import { DefaultMenu, SuperMenu, colors } from "@/lib/var";

// Flatten menu items to get all items with href
const flattenMenuItems = (menu: MenuItem[]): MenuItem[] => {
  const result: MenuItem[] = [];
  menu.forEach((item) => {
    if (item.href && item.href !== "/") {
      result.push(item);
    }
    if (item.children) {
      item.children.forEach((child) => {
        if (child.href) {
          result.push(child);
        }
      });
    }
  });
  return result;
};

export default function Dashboard() {
  const { state } = useGlobalState();
  const [menuList, setMenuList] = useState<MenuItem[]>(
    flattenMenuItems(DefaultMenu),
  );

  useEffect(() => {
    if (state.user && state.user.role === "SUPERADMIN") {
      setMenuList(flattenMenuItems(SuperMenu));
    }
  }, [state]);

  return (
    <div className="space-y-8 flex flex-col items-center justify-center min-h-[90dvh]">
      <div className="flex flex-col items-center">
        <div>
          <Image src="/logo-colored.png" alt="logo" width={500} height={200} />
        </div>
        <p className="text-gray-600 mt-1">
          Welcome {state?.user?.display_name ?? "Admin"}, Let's Manage Your
          Company Profile Here
        </p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {menuList.map((menu: MenuItem, index: number) => {
          const Icon = menu.icon;
          const iconColor = colors[index % colors.length];
          return (
            <Link
              href={menu.href || "#"}
              key={menu.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {menu.text}
                  </p>
                </div>
                {Icon && (
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${iconColor}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: iconColor }} />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
