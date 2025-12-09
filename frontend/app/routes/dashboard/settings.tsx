import React from 'react';
import type { Route } from "../../+types/root";



export function meta({}: Route.MetaArgs) {
  return [
    { title: "PMT- Setting" },
    { name: "description", content: "Welcome Ashkam Energy Pvt Ltd!" },
  ];
}

const Setting = () => {
  return (
    <div className='flex justify-center items-center h-full'>
      <span className='text-xl font-bold text-blue-800'>Settings</span>
    </div>
  )
}

export default Setting;