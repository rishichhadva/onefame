import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MapPin, Calendar, Check, MessageCircle } from "lucide-react";

const ServiceProviderProfile = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packages = [
    {
      id: "basic",
      name: "Basic Package",
      price: 299,
      duration: "2 hours",
      deliverables: [
        "30 edited photos",
        "Online gallery",
        "2 locations",
        "1 outfit change",
      ],
    },
    {
      id: "standard",
      name: "Standard Package",
      price: 499,
      duration: "4 hours",
      deliverables: [
        "60 edited photos",
        "Online gallery",
        "3 locations",
        "3 outfit changes",
        "Basic retouching",
      ],
      popular: true,
    },
    {
      id: "premium",
      name: "Premium Package",
      price: 799,
      duration: "Full day",
      deliverables: [
        "100+ edited photos",
        "Online gallery",
        "Unlimited locations",
        "Unlimited outfit changes",
        "Advanced retouching",
        "Print rights",
      ],
    },
  ];

  const portfolio = [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ];

  const reviews = [
    {
      id: "1",
      name: "Emma Wilson",
      rating: 5,
      date: "2 weeks ago",
      comment: "Absolutely amazing work! Professional, creative, and delivered exactly what I needed.",
    },
    {
      id: "2",
      name: "James Brown",
      rating: 5,
      date: "1 month ago",
      comment: "Best photographer I've worked with. Highly recommended for influencer content!",
    },
    {
      id: "3",
      name: "Lisa Martinez",
      rating: 4,
      date: "2 months ago",
      comment: "Great experience overall. Photos turned out beautiful and professional.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-gradient-subtle py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>MJ</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">Mike Johnson Photography</h1>
                      <Badge className="bg-primary">Pro</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold">4.9</span>
                        <span>(127 reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>Los Angeles, CA</span>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      Professional photographer specializing in influencer content, lifestyle, and brand photography. 
                      8+ years experience working with top influencers and brands.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">Photography</Badge>
                      <Badge variant="secondary">Videography</Badge>
                      <Badge variant="secondary">Content Creation</Badge>
                      <Badge variant="secondary">Brand Shoots</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Starting from</p>
                      <p className="text-3xl font-bold">₹299</p>
                    </div>
                    <Button 
                      className="w-full mb-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-300 text-white font-bold shadow hover:from-blue-600 hover:to-cyan-400 transition"
                      size="lg"
                      onClick={() => navigate("/booking")}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full rounded-lg border-blue-300 text-blue-700 font-bold shadow hover:bg-blue-100 transition" size="lg">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-12">
          <Tabs defaultValue="packages" className="space-y-8">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="packages" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Pricing Packages</h2>
                <p className="text-muted-foreground">Choose the package that best fits your needs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Card 
                    key={pkg.id}
                    className={`relative rounded-lg border-blue-200 shadow-lg ${selectedPackage === pkg.id ? "ring-2 ring-blue-500" : ""} ${pkg.popular ? "shadow-elegant" : ""}`}
                  >
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-gradient-primary">Most Popular</Badge>
                      </div>
                    )}
                    <CardContent className="p-6 flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold">₹{pkg.price}</span>
                          <span className="text-muted-foreground ml-2">/ {pkg.duration}</span>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {pkg.deliverables.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check className="h-5 w-5 text-primary flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button 
                        className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold shadow hover:from-blue-600 hover:to-cyan-500 transition mt-auto"
                        variant={selectedPackage === pkg.id ? "default" : "outline"}
                        onClick={() => {
                          setSelectedPackage(pkg.id);
                          navigate("/booking", { state: { package: pkg } });
                        }}
                      >
                        {selectedPackage === pkg.id ? "Selected" : "Select Package"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Portfolio</h2>
                <p className="text-muted-foreground">Recent work and projects</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {portfolio.map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
                    <img 
                      src={img} 
                      alt={`Portfolio ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Reviews</h2>
                <p className="text-muted-foreground">What clients are saying</p>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="rounded-lg border-blue-200 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>{review.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold">{review.name}</p>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-4 w-4 ${
                                  idx < review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceProviderProfile;
