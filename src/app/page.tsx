import Navbar from "@/app/components/Navbar";
import TrackingForm from "@/app/components/TrackingForm";
import LoginBtn from "@/app/components/LoginBtn";

export default function Home() {

return (
  <>
    <Navbar AuthButton={<LoginBtn />}/>
    <TrackingForm />
  </>
);
}
