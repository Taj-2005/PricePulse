'use client';

import Navbar from "@/app/components/Navbar";
import LoginBtn from "@/app/components/LoginBtn";
import TrackingForm from "./components/TrackingForm";


export default function Home() {
return (
  <>
    <Navbar AuthButton={<LoginBtn />}/>
    <TrackingForm />
  </>
);
}