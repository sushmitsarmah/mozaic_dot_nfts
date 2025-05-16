
import { useState } from "react";
import { Link } from "react-router-dom";
import { nfts, categories } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  
  // Filter NFTs based on search query and category
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? nft.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });
  
  // Sort NFTs based on selected sort option
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price-high":
        return parseFloat((b.price || "0").split(" ")[0]) - parseFloat((a.price || "0").split(" ")[0]);
      case "price-low":
        return parseFloat((a.price || "0").split(" ")[0]) - parseFloat((b.price || "0").split(" ")[0]);
      default:
        return 0;
    }
  });
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">NFT Gallery</h1>
        
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-grow">
            <Input 
              placeholder="Search NFTs or creators..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-nft-dark-purple border-nft-purple/30 focus-visible:ring-nft-purple"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40 bg-nft-dark-purple border-nft-purple/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-nft-dark-purple border-nft-purple/30">
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 bg-nft-dark-purple border-nft-purple/30">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-nft-dark-purple border-nft-purple/30">
                <SelectItem value="recent">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            className={selectedCategory === "" ? "bg-nft-purple" : "border-nft-purple/30"}
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category.slug ? "bg-nft-purple" : "border-nft-purple/30"}
              onClick={() => setSelectedCategory(category.slug)}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {/* NFT Grid */}
        {sortedNFTs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedNFTs.map((nft) => (
              <Link to={`/nft/${nft.id}`} key={nft.id}>
                <Card className="overflow-hidden bg-nft-dark-purple border-none nft-card group transition-all duration-300 hover:shadow-xl hover:shadow-nft-purple/20">
                  <div className="relative">
                    <img 
                      src={nft.image} 
                      alt={nft.title}
                      className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 nft-card-overlay flex items-end p-4">
                      {nft.price && (
                        <Badge variant="secondary" className="bg-nft-purple text-white mb-2">
                          {nft.price}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg truncate">{nft.title}</h3>
                      {categories.find(c => c.slug === nft.category) && (
                        <Badge variant="outline" className="border-nft-blue text-nft-blue">
                          {categories.find(c => c.slug === nft.category)?.name}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">By {nft.creator}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No NFTs found matching your search.</p>
            <Button 
              variant="link" 
              className="text-nft-purple mt-2"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;
