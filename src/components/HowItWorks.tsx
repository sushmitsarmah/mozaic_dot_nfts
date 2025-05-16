
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    number: "01",
    title: "Connect Your Wallet",
    description: "Connect your Polkadot.js wallet to get started with creating and collecting NFTs."
  },
  {
    number: "02",
    title: "Generate AI Art",
    description: "Use text prompts to create unique AI-generated artwork that can be turned into NFTs."
  },
  {
    number: "03",
    title: "Mint Your NFT",
    description: "Add metadata, choose a category, and mint your creation on the Polkadot network."
  },
  {
    number: "04",
    title: "Showcase & Trade",
    description: "Your NFT is now visible in the gallery and available for other collectors to discover."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-16 px-4 bg-gradient-to-b from-background to-nft-dark-purple/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Creating and collecting AI-generated NFTs on NexusArt is simple
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <Card key={step.number} className="bg-black/20 backdrop-blur-sm border border-nft-purple/20">
              <CardContent className="p-6">
                <div className="text-4xl font-bold text-nft-purple mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
