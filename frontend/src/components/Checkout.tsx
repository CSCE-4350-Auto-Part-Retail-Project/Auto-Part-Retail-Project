import { useState } from "react";
import { Button } from "./ui/button";

interface CheckoutProps {
  totalAmount: number;
  onComplete: (payment: PaymentData) => void;
}

export interface PaymentData {
  payment_id: number;
  order_id: number;
  amount: number;
  card_number: string;
  date: string;
}

const API_BASE = `${window.location.protocol}//${window.location.hostname}:3001`;

export function Checkout({ totalAmount, onComplete }: CheckoutProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
  setError("");
  if (!cardNumber || cardNumber.length < 12) {
    setError("Please enter a valid card number.");
    return;
  }

  setLoading(true);

  const payment_id = Math.floor(Math.random() * 1_000_000_000);
  const order_id = Math.floor(Math.random() * 1_000_000_000);

  const payment: PaymentData = {
    payment_id,
    order_id,
    amount: totalAmount,
    card_number: cardNumber,
    date: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_BASE}/api/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payment),
    });

    const data = await response.json();
    console.log("Server response:", data);

    if (data.success) {
      onComplete(payment); // call the original callback to close modal, etc.
    } else {
      setError("Payment failed on server");
    }
  } catch (err) {
    console.error(err);
    setError("Network error during payment");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      <div className="mb-4">
        <label className="block text-slate-700 mb-2">Total Amount</label>
        <input
          type="text"
          readOnly
          value={`$${totalAmount.toFixed(2)}`}
          className="w-full border rounded px-3 py-2 bg-slate-100"
        />
      </div>
      <div className="mb-4">
        <label className="block text-slate-700 mb-2">Card Number</label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="1234 5678 9012 3456"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button onClick={handleSubmit} disabled={loading} className="w-full">
        {loading ? "Processing..." : "Pay Now"}
      </Button>
    </div>
  );
}
