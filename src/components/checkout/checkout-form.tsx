import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

const Checkout = () => {
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: {},
    paymentMethod: "",
    items: [],
    totalAmount: 0,
  });
  const [currentStep, setCurrentStep] = useState("address");

  const handleAddressSubmit = (addressData: any) => {
    setCheckoutData((prev) => ({
      ...prev,
      shippingAddress: {
        phoneNumber: addressData.phoneNumber,
        buildingName: addressData.buildingName || "",
        locality: addressData.locality,
        wardNo: addressData.wardNo || "",
        postalCode: addressData.postalCode,
        district: addressData.district,
        province: addressData.province,
        country: addressData.country,
        landmark: addressData.landmark || "",
      },
    }));
    setCurrentStep("payment");
  };

  const handlePaymentSubmit = (paymentData: any) => {
    setCheckoutData((prev) => ({
      ...prev,
      paymentMethod: paymentData.paymentMethod,
    }));
    setCurrentStep("review");
  };

  const handlePlaceOrder = () => {
    // Place order logic
  };

  const AddressForm = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const addressData = Object.fromEntries(formData.entries());
          handleAddressSubmit(addressData);
        }}
      >
        <div className="mb-4">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" name="phoneNumber" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="buildingName">Building Name</Label>
          <Input id="buildingName" name="buildingName" />
        </div>
        <div className="mb-4">
          <Label htmlFor="locality">Locality</Label>
          <Input id="locality" name="locality" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="wardNo">Ward No</Label>
          <Input id="wardNo" name="wardNo" />
        </div>
        <div className="mb-4">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" name="postalCode" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="district">District</Label>
          <Input id="district" name="district" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="province">Province</Label>
          <Input id="province" name="province" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" required />
        </div>
        <div className="mb-4">
          <Label htmlFor="landmark">Landmark</Label>
          <Input id="landmark" name="landmark" />
        </div>
        <Button type="submit">Next</Button>
      </form>
    </div>
  );

  const PaymentForm = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Payment Method</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          const paymentData = Object.fromEntries(formData.entries());
          handlePaymentSubmit(paymentData);
        }}
      >
        <div className="mb-4">
          <Label htmlFor="paymentMethod">Payment Method</Label>
          <select id="paymentMethod" name="paymentMethod" required>
            <option value="esewa">eSewa</option>
            <option value="khalti">Khalti</option>
            <option value="mobile_banking">Mobile Banking</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
          </select>
        </div>
        <Button type="submit">Next</Button>
      </form>
    </div>
  );

  const AddressDisplay = ({ address }: { address: any }) => (
    <div className="text-sm space-y-1">
      <p>{address.phoneNumber}</p>
      {address.buildingName && <p>{address.buildingName}</p>}
      <p>{address.locality}</p>
      {address.wardNo && <p>Ward: {address.wardNo}</p>}
      <p>
        {address.district}, {address.province} {address.postalCode}
      </p>
      <p>{address.country}</p>
      {address.landmark && <p>Landmark: {address.landmark}</p>}
    </div>
  );

  const ReviewOrder = () => (
    <div>
      <h2 className="text-xl font-bold mb-4">Review Order</h2>
      <div className="mb-4">
        <h3 className="font-medium">Shipping Address</h3>
        <AddressDisplay address={checkoutData.shippingAddress} />
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Payment Method</h3>
        <p>{checkoutData.paymentMethod}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Order Items</h3>
        <ul>
          {checkoutData.items.map((item, index) => (
            <li key={index}>
              {item.name} - {item.quantity} x {formatPrice(item.price)}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="font-medium">Total Amount</h3>
        <p>{formatPrice(checkoutData.totalAmount)}</p>
      </div>
      <Button onClick={handlePlaceOrder}>Place Order</Button>
    </div>
  );

  return (
    <div className="container py-8">
      {currentStep === "address" && <AddressForm />}
      {currentStep === "payment" && <PaymentForm />}
      {currentStep === "review" && <ReviewOrder />}
    </div>
  );
};

export default Checkout;
