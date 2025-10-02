import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check } from "lucide-react";

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPackage = location.state?.package;
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState("");
  const [notes, setNotes] = useState("");

  const timeSlots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "1:00 PM - 3:00 PM",
    "3:00 PM - 5:00 PM",
    "5:00 PM - 7:00 PM",
  ];

  const handleBooking = () => {
    navigate("/checkout", { 
      state: { 
        package: selectedPackage,
        date,
        timeSlot,
        notes 
      } 
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Book Your Session</h1>
            <p className="text-muted-foreground">Select your preferred date and time</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Package Summary */}
              {selectedPackage && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Package</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg">{selectedPackage.name}</p>
                        <p className="text-muted-foreground">{selectedPackage.duration}</p>
                      </div>
                      <p className="text-2xl font-bold">${selectedPackage.price}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      {selectedPackage.deliverables.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Date Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                    disabled={(date) => date < new Date()}
                  />
                </CardContent>
              </Card>

              {/* Time Slot Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Time Slot</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={timeSlot} onValueChange={setTimeSlot}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {timeSlots.map((slot) => (
                        <div key={slot}>
                          <RadioGroupItem
                            value={slot}
                            id={slot}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={slot}
                            className="flex items-center justify-center rounded-lg border-2 border-muted bg-background p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent cursor-pointer"
                          >
                            {slot}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes (Optional)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Any special requirements or preferences..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Service Provider</p>
                    <p className="font-semibold">Mike Johnson Photography</p>
                  </div>
                  {selectedPackage && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Package</p>
                      <p className="font-semibold">{selectedPackage.name}</p>
                    </div>
                  )}
                  {date && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date</p>
                      <p className="font-semibold">{date.toLocaleDateString()}</p>
                    </div>
                  )}
                  {timeSlot && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Time</p>
                      <p className="font-semibold">{timeSlot}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-semibold">Total</p>
                      <p className="text-2xl font-bold">
                        ${selectedPackage?.price || 299}
                      </p>
                    </div>
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={handleBooking}
                      disabled={!date || !timeSlot}
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Booking;
