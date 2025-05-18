
import { useState } from "react";
import { Link } from "react-router-dom";
import { nfts, categories } from "@/data/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { GalleryHorizontal } from "lucide-react";

const Gallery = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Number of NFTs per page
  
  // Filter NFTs based on search query and category
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          nft.creator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" ? true : nft.category === selectedCategory;
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
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedNFTs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentNFTs = sortedNFTs.slice(startIndex, startIndex + itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-4xl font-bold">NFT Gallery</h1>
          
          <div className="flex items-center space-x-2">
            <GalleryHorizontal className="h-6 w-6 text-nft-purple mr-2" />
            <span className="text-gray-400">
              {filteredNFTs.length} {filteredNFTs.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-grow">
            <Input 
              placeholder="Search NFTs or creators..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className="bg-nft-dark-purple border-nft-purple/30 focus-visible:ring-nft-purple"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select 
              value={selectedCategory} 
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            >
              <SelectTrigger className="w-full sm:w-40 bg-nft-dark-purple border-nft-purple/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-nft-dark-purple border-nft-purple/30">
                <SelectItem value="all">All Categories</SelectItem>
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
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            className={selectedCategory === "all" ? "bg-nft-purple" : "border-nft-purple/30"}
            onClick={() => {
              setSelectedCategory("all");
              setCurrentPage(1); // Reset to first page when filtering
            }}
          >
            All
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category.slug ? "bg-nft-purple" : "border-nft-purple/30"}
              onClick={() => {
                setSelectedCategory(category.slug);
                setCurrentPage(1); // Reset to first page when filtering
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {/* NFT Grid */}
        {currentNFTs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentNFTs.map((nft) => (
                <Link to={`/nft/${nft.id}`} key={nft.id} className="transition-transform hover:scale-105 duration-300">
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination className="my-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No NFTs found matching your search.</p>
            <Button 
              variant="link" 
              className="text-nft-purple mt-2"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setCurrentPage(1);
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
