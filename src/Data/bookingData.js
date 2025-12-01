// /* ---------------------- MAIN SERVICE TYPES ---------------------- */
// export const serviceTypes = [
//   {
//     id: "car",
//     name: "Car Detailing",
//     // top-level vehicleTypes that map to this service; variants give per-vehicle pricing
//     vehicleTypes: ["car", "sedan", "suv", "truck", "van"],
//     // variants allow separate packages & additionalServices for Sedan / SUV / Truck / Van
//     variants: [
//       {
//         id: "sedan",
//         name: "Sedan",
//         vehicleTypes: ["sedan"],
//         packages: [
//           {
//             id: "sedan-basic-full",
//             name: "Basic Full Package",
//             price: 199,
//             description: "Basic interior and exterior package for sedans",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package", "Basic Exterior Package"]
//           },
//           {
//             id: "sedan-premium-full",
//             name: "Premium Full Package",
//             price: 269,
//             description: "Premium interior and exterior package for sedans",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package", "Premium Exterior Package"]
//           },
//           {
//             id: "sedan-basic-interior",
//             name: "Basic Interior Only",
//             price: 159,
//             description: "Basic interior package only (sedan)",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package"]
//           },
//           {
//             id: "sedan-premium-interior",
//             name: "Premium Interior Only",
//             price: 199,
//             description: "Premium interior package only (sedan)",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package"]
//           },
//           {
//             id: "sedan-basic-exterior",
//             name: "Basic Exterior Only",
//             price: 149,
//             description: "Basic exterior package only (sedan)",
//             pricingType: "fixed",
//             includes: ["Basic Exterior Package"]
//           },
//           {
//             id: "sedan-premium-exterior",
//             name: "Premium Exterior Only",
//             price: 179,
//             description: "Premium exterior package only (sedan)",
//             pricingType: "fixed",
//             includes: ["Premium Exterior Package"]
//           }
//         ],
//         additionalServices: [
//           { id: "sedan-pet-hair", name: "Pet Hair Removal", price: 19, description: "Remove embedded pet hair (sedan)" },
//           { id: "sedan-odor-elimination", name: "Odor Elimination", price: 29, description: "Neutralize odors (sedan)" },
//           { id: "sedan-headlight-restoration", name: "Headlight Restoration", price: 39, description: "Restore headlights (sedan)" }
//         ]
//       },
//       {
//         id: "suv",
//         name: "SUV",
//         vehicleTypes: ["suv"],
//         packages: [
//           {
//             id: "suv-basic-full",
//             name: "Basic Full Package",
//             price: 239,
//             description: "Basic interior and exterior package for SUVs",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package", "Basic Exterior Package"]
//           },
//           {
//             id: "suv-premium-full",
//             name: "Premium Full Package",
//             price: 319,
//             description: "Premium interior and exterior package for SUVs",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package", "Premium Exterior Package"]
//           },
//           {
//             id: "suv-basic-interior",
//             name: "Basic Interior Only",
//             price: 199,
//             description: "Basic interior package only (SUV)",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package"]
//           },
//           {
//             id: "suv-premium-interior",
//             name: "Premium Interior Only",
//             price: 249,
//             description: "Premium interior package only (SUV)",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package"]
//           },
//           {
//             id: "suv-basic-exterior",
//             name: "Basic Exterior Only",
//             price: 179,
//             description: "Basic exterior package only (SUV)",
//             pricingType: "fixed",
//             includes: ["Basic Exterior Package"]
//           },
//           {
//             id: "suv-premium-exterior",
//             name: "Premium Exterior Only",
//             price: 209,
//             description: "Premium exterior package only (SUV)",
//             pricingType: "fixed",
//             includes: ["Premium Exterior Package"]
//           }
//         ],
//         additionalServices: [
//           { id: "suv-pet-hair", name: "Pet Hair Removal", price: 29, description: "Remove embedded pet hair (SUV)" },
//           { id: "suv-odor-elimination", name: "Odor Elimination", price: 39, description: "Neutralize odors (SUV)" },
//           { id: "suv-headlight-restoration", name: "Headlight Restoration", price: 49, description: "Restore headlights (SUV)" }
//         ]
//       },
//       {
//         id: "truck",
//         name: "Truck",
//         vehicleTypes: ["truck"],
//         packages: [
//           {
//             id: "truck-basic-full",
//             name: "Basic Full Package",
//             price: 259,
//             description: "Basic interior and exterior package for trucks",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package", "Basic Exterior Package"]
//           },
//           {
//             id: "truck-premium-full",
//             name: "Premium Full Package",
//             price: 349,
//             description: "Premium interior and exterior package for trucks",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package", "Premium Exterior Package"]
//           },
//           {
//             id: "truck-basic-interior",
//             name: "Basic Interior Only",
//             price: 209,
//             description: "Basic interior package only (truck)",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package"]
//           },
//           {
//             id: "truck-premium-interior",
//             name: "Premium Interior Only",
//             price: 259,
//             description: "Premium interior package only (truck)",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package"]
//           },
//           {
//             id: "truck-basic-exterior",
//             name: "Basic Exterior Only",
//             price: 199,
//             description: "Basic exterior package only (truck)",
//             pricingType: "fixed",
//             includes: ["Basic Exterior Package"]
//           },
//           {
//             id: "truck-premium-exterior",
//             name: "Premium Exterior Only",
//             price: 239,
//             description: "Premium exterior package only (truck)",
//             pricingType: "fixed",
//             includes: ["Premium Exterior Package"]
//           }
//         ],
//         additionalServices: [
//           { id: "truck-pet-hair", name: "Pet Hair Removal", price: 34, description: "Remove embedded pet hair (truck)" },
//           { id: "truck-odor-elimination", name: "Odor Elimination", price: 44, description: "Neutralize odors (truck)" },
//           { id: "truck-headlight-restoration", name: "Headlight Restoration", price: 54, description: "Restore headlights (truck)" }
//         ]
//       },
//       {
//         id: "van",
//         name: "Van",
//         vehicleTypes: ["van"],
//         packages: [
//           {
//             id: "van-basic-full",
//             name: "Basic Full Package",
//             price: 229,
//             description: "Basic interior and exterior package for vans",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package", "Basic Exterior Package"]
//           },
//           {
//             id: "van-premium-full",
//             name: "Premium Full Package",
//             price: 319,
//             description: "Premium interior and exterior package for vans",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package", "Premium Exterior Package"]
//           },
//           {
//             id: "van-basic-interior",
//             name: "Basic Interior Only",
//             price: 189,
//             description: "Basic interior package only (van)",
//             pricingType: "fixed",
//             includes: ["Basic Interior Package"]
//           },
//           {
//             id: "van-premium-interior",
//             name: "Premium Interior Only",
//             price: 229,
//             description: "Premium interior package only (van)",
//             pricingType: "fixed",
//             includes: ["Premium Interior Package"]
//           },
//           {
//             id: "van-basic-exterior",
//             name: "Basic Exterior Only",
//             price: 169,
//             description: "Basic exterior package only (van)",
//             pricingType: "fixed",
//             includes: ["Basic Exterior Package"]
//           },
//           {
//             id: "van-premium-exterior",
//             name: "Premium Exterior Only",
//             price: 239,
//             description: "Premium exterior package only (van)",
//             pricingType: "fixed",
//             includes: ["Premium Exterior Package"]
//           }
//         ],
//         additionalServices: [
//           { id: "van-pet-hair", name: "Pet Hair Removal", price: 28, description: "Remove embedded pet hair (van)" },
//           { id: "van-odor-elimination", name: "Odor Elimination", price: 38, description: "Neutralize odors (van)" },
//           { id: "van-headlight-restoration", name: "Headlight Restoration", price: 48, description: "Restore headlights (van)" }
//         ]
//       }
//     ]
//   },
//   {
//     id: "boat",
//     name: "Boat Detailing",
//     vehicleTypes: ["boat"],
//     packages: [
//       {
//         id: "boat-full",
//         name: "Full Boat Service",
//         price: 35,
//         description: "Complete boat interior and exterior detailing",
//         pricingType: "perFoot",
//         includes: ["Boat Interior Services", "Boat Exterior Services"]
//       },
//       {
//         id: "boat-interior",
//         name: "Boat Interior Only",
//         price: 19,
//         description: "Boat interior detailing only",
//         pricingType: "perFoot",
//         includes: ["Boat Interior Services"]
//       },
//       {
//         id: "boat-exterior",
//         name: "Boat Exterior Only",
//         price: 23,
//         description: "Boat exterior detailing only",
//         pricingType: "perFoot",
//         includes: ["Boat Exterior Services"]
//       }
//     ],
//     additionalServices: [
//       { id: "boat-uv-protection", name: "UV Protection Coating", price: 149, description: "Premium UV protection for marine environment" },
//       { id: "boat-mildew-treatment", name: "Mildew Treatment", price: 74, description: "Anti-mildew treatment for marine conditions" }
//     ]
//   },
//   {
//     id: "jet-ski",
//     name: "Jet Ski Detailing",
//     vehicleTypes: ["jet-ski"],
//     packages: [
//       {
//         id: "jet-ski-full",
//         name: "Jet Ski Full Detailing",
//         price: 35,
//         description: "Complete jet ski detailing package (priced per foot)",
//         pricingType: "perFoot", // changed to perFoot as requested
//         includes: ["Jet Ski Exterior Services", "Jet Ski Interior/Functional Areas"]
//       }
//     ],
//     additionalServices: [
//       { id: "jet-ski-rust-protection", name: "Rust Protection", price: 59, description: "Anti-rust treatment for saltwater protection" }
//     ]
//   },
//   {
//     id: "rv",
//     name: "RV Detailing",
//     vehicleTypes: ["rv"],
//     packages: [
//       {
//         id: "rv-full",
//         name: "Full RV Service",
//         price: 39,
//         description: "Complete RV interior and exterior detailing",
//         pricingType: "perFoot",
//         includes: ["RV Interior Services", "RV Exterior Services"]
//       },
//       {
//         id: "rv-interior",
//         name: "RV Interior Only",
//         price: 25,
//         description: "RV interior detailing only",
//         pricingType: "perFoot",
//         includes: ["RV Interior Services"]
//       },
//       {
//         id: "rv-exterior",
//         name: "RV Exterior Only",
//         price: 25,
//         description: "RV exterior detailing only",
//         pricingType: "perFoot",
//         includes: ["RV Exterior Services"]
//       }
//     ],
//     additionalServices: [
//       { id: "rv-roof-treatment", name: "Roof Sealant Treatment", price: 119, description: "Professional roof sealing and protection" },
//       { id: "rv-tank-cleaning", name: "Water Tank Cleaning", price: 79, description: "Fresh water tank cleaning and sanitization" }
//     ]
//   },
//   {
//     id: "motorcycle",
//     name: "Motorcycle Detailing",
//     vehicleTypes: ["motorcycle"],
//     packages: [
//       {
//         id: "bike-full",
//         name: "Full Bike Detailing",
//         price: 169,
//         description: "Complete motorcycle detailing package",
//         pricingType: "fixed",
//         includes: ["Bike Exterior Services", "Bike Detailing & Protection"]
//       }
//     ],
//     additionalServices: [
//       { id: "bike-chain-service", name: "Chain Service", price: 29, description: "Complete chain cleaning and lubrication" },
//       { id: "bike-chrome-polish", name: "Chrome Polish", price: 44, description: "Premium chrome polishing and protection" }
//     ]
//   }
// ];

// /* ---------------------- VEHICLE TYPES ---------------------- */
// export const vehicleTypes = [
//   { id: "car", name: "Car" },
//   { id: "sedan", name: "Sedan" },
//   { id: "suv", name: "SUV" },
//   { id: "truck", name: "Truck" },
//   { id: "van", name: "Van" },
//   { id: "boat", name: "Boat" },
//   { id: "jet-ski", name: "Jet Ski" },
//   { id: "rv", name: "RV" },
//   { id: "motorcycle", name: "Motorcycle" }
// ];

// /* ---------------------- MAIN SERVICES (global add-ons) ---------------------- */
// export const mainServices = [
//   {
//     id: "window-tinting",
//     name: "Window Tinting",
//     // price: 80,
//     description: "Professional window tinting (price may vary by vehicle size)",
//     // pricingType: "fixed"
//   },
//   {
//     id: "ceramic-coating",
//     name: "Ceramic Coating",
//     // price: 250,
//     description: "Long-lasting paint protection (surface prep + ceramic application)",
//     // pricingType: "fixed"
//   },
//   {
//     id: "paint-correction",
//     name: "Paint Correction",
//     // price: 180,
//     description: "Multi-stage paint correction to remove swirls and imperfections",
//     // pricingType: "fixed"
//   },
//   {
//     id: "mobile-detailing",
//     name: "Mobile Detailing",
//     // price: 40,
//     description: "On-site detailing service (travel fee may apply)",
//     // pricingType: "fixed"
//   }
// ];






// /Data/servicesData.js

/* ---------------------- ALL SERVICE TYPES DATA ---------------------- */

export const ALL_SERVICES = {
  // ✅ VEHICLE SERVICES
  VEHICLE: {
    id: "vehicle",
    name: "Vehicle Cleaning",
    icon: "Car",
    services: [
      {
        id: "car-detailing",
        name: "Car Detailing",
        vehicleTypes: ["car", "sedan", "suv", "truck", "van"],
        variants: [
          {
            id: "sedan",
            name: "Sedan",
            vehicleTypes: ["sedan"],
            packages: [
              {
                id: "sedan-basic-full",
                name: "Basic Full Package",
                price: 199,
                description: "Basic interior and exterior package for sedans",
                pricingType: "fixed",
                includes: ["Basic Interior Package", "Basic Exterior Package"]
              },
              {
                id: "sedan-premium-full",
                name: "Premium Full Package",
                price: 269,
                description: "Premium interior and exterior package for sedans",
                pricingType: "fixed",
                includes: ["Premium Interior Package", "Premium Exterior Package"]
              },
              {
                id: "sedan-basic-interior",
                name: "Basic Interior Only",
                price: 159,
                description: "Basic interior package only (sedan)",
                pricingType: "fixed",
                includes: ["Basic Interior Package"]
              },
              {
                id: "sedan-premium-interior",
                name: "Premium Interior Only",
                price: 199,
                description: "Premium interior package only (sedan)",
                pricingType: "fixed",
                includes: ["Premium Interior Package"]
              },
              {
                id: "sedan-basic-exterior",
                name: "Basic Exterior Only",
                price: 149,
                description: "Basic exterior package only (sedan)",
                pricingType: "fixed",
                includes: ["Basic Exterior Package"]
              },
              {
                id: "sedan-premium-exterior",
                name: "Premium Exterior Only",
                price: 179,
                description: "Premium exterior package only (sedan)",
                pricingType: "fixed",
                includes: ["Premium Exterior Package"]
              }
            ],
            additionalServices: [
              { id: "sedan-pet-hair", name: "Pet Hair Removal", price: 19, description: "Remove embedded pet hair (sedan)" },
              { id: "sedan-odor-elimination", name: "Odor Elimination", price: 29, description: "Neutralize odors (sedan)" },
              { id: "sedan-headlight-restoration", name: "Headlight Restoration", price: 39, description: "Restore headlights (sedan)" }
            ]
          },
          {
            id: "suv",
            name: "SUV",
            vehicleTypes: ["suv"],
            packages: [
              {
                id: "suv-basic-full",
                name: "Basic Full Package",
                price: 239,
                description: "Basic interior and exterior package for SUVs",
                pricingType: "fixed",
                includes: ["Basic Interior Package", "Basic Exterior Package"]
              },
              {
                id: "suv-premium-full",
                name: "Premium Full Package",
                price: 319,
                description: "Premium interior and exterior package for SUVs",
                pricingType: "fixed",
                includes: ["Premium Interior Package", "Premium Exterior Package"]
              },
              {
                id: "suv-basic-interior",
                name: "Basic Interior Only",
                price: 199,
                description: "Basic interior package only (SUV)",
                pricingType: "fixed",
                includes: ["Basic Interior Package"]
              },
              {
                id: "suv-premium-interior",
                name: "Premium Interior Only",
                price: 249,
                description: "Premium interior package only (SUV)",
                pricingType: "fixed",
                includes: ["Premium Interior Package"]
              },
              {
                id: "suv-basic-exterior",
                name: "Basic Exterior Only",
                price: 179,
                description: "Basic exterior package only (SUV)",
                pricingType: "fixed",
                includes: ["Basic Exterior Package"]
              },
              {
                id: "suv-premium-exterior",
                name: "Premium Exterior Only",
                price: 209,
                description: "Premium exterior package only (SUV)",
                pricingType: "fixed",
                includes: ["Premium Exterior Package"]
              }
            ],
            additionalServices: [
              { id: "suv-pet-hair", name: "Pet Hair Removal", price: 29, description: "Remove embedded pet hair (SUV)" },
              { id: "suv-odor-elimination", name: "Odor Elimination", price: 39, description: "Neutralize odors (SUV)" },
              { id: "suv-headlight-restoration", name: "Headlight Restoration", price: 49, description: "Restore headlights (SUV)" }
            ]
          },
          {
            id: "truck",
            name: "Truck",
            vehicleTypes: ["truck"],
            packages: [
              {
                id: "truck-basic-full",
                name: "Basic Full Package",
                price: 259,
                description: "Basic interior and exterior package for trucks",
                pricingType: "fixed",
                includes: ["Basic Interior Package", "Basic Exterior Package"]
              },
              {
                id: "truck-premium-full",
                name: "Premium Full Package",
                price: 349,
                description: "Premium interior and exterior package for trucks",
                pricingType: "fixed",
                includes: ["Premium Interior Package", "Premium Exterior Package"]
              },
              {
                id: "truck-basic-interior",
                name: "Basic Interior Only",
                price: 209,
                description: "Basic interior package only (truck)",
                pricingType: "fixed",
                includes: ["Basic Interior Package"]
              },
              {
                id: "truck-premium-interior",
                name: "Premium Interior Only",
                price: 259,
                description: "Premium interior package only (truck)",
                pricingType: "fixed",
                includes: ["Premium Interior Package"]
              },
              {
                id: "truck-basic-exterior",
                name: "Basic Exterior Only",
                price: 199,
                description: "Basic exterior package only (truck)",
                pricingType: "fixed",
                includes: ["Basic Exterior Package"]
              },
              {
                id: "truck-premium-exterior",
                name: "Premium Exterior Only",
                price: 239,
                description: "Premium exterior package only (truck)",
                pricingType: "fixed",
                includes: ["Premium Exterior Package"]
              }
            ],
            additionalServices: [
              { id: "truck-pet-hair", name: "Pet Hair Removal", price: 34, description: "Remove embedded pet hair (truck)" },
              { id: "truck-odor-elimination", name: "Odor Elimination", price: 44, description: "Neutralize odors (truck)" },
              { id: "truck-headlight-restoration", name: "Headlight Restoration", price: 54, description: "Restore headlights (truck)" }
            ]
          },
          {
            id: "van",
            name: "Van",
            vehicleTypes: ["van"],
            packages: [
              {
                id: "van-basic-full",
                name: "Basic Full Package",
                price: 229,
                description: "Basic interior and exterior package for vans",
                pricingType: "fixed",
                includes: ["Basic Interior Package", "Basic Exterior Package"]
              },
              {
                id: "van-premium-full",
                name: "Premium Full Package",
                price: 319,
                description: "Premium interior and exterior package for vans",
                pricingType: "fixed",
                includes: ["Premium Interior Package", "Premium Exterior Package"]
              },
              {
                id: "van-basic-interior",
                name: "Basic Interior Only",
                price: 189,
                description: "Basic interior package only (van)",
                pricingType: "fixed",
                includes: ["Basic Interior Package"]
              },
              {
                id: "van-premium-interior",
                name: "Premium Interior Only",
                price: 229,
                description: "Premium interior package only (van)",
                pricingType: "fixed",
                includes: ["Premium Interior Package"]
              },
              {
                id: "van-basic-exterior",
                name: "Basic Exterior Only",
                price: 169,
                description: "Basic exterior package only (van)",
                pricingType: "fixed",
                includes: ["Basic Exterior Package"]
              },
              {
                id: "van-premium-exterior",
                name: "Premium Exterior Only",
                price: 239,
                description: "Premium exterior package only (van)",
                pricingType: "fixed",
                includes: ["Premium Exterior Package"]
              }
            ],
            additionalServices: [
              { id: "van-pet-hair", name: "Pet Hair Removal", price: 28, description: "Remove embedded pet hair (van)" },
              { id: "van-odor-elimination", name: "Odor Elimination", price: 38, description: "Neutralize odors (van)" },
              { id: "van-headlight-restoration", name: "Headlight Restoration", price: 48, description: "Restore headlights (van)" }
            ]
          }
        ]
      },
      {
        id: "boat",
        name: "Boat Detailing",
        vehicleTypes: ["boat"],
        packages: [
          {
            id: "boat-full",
            name: "Full Boat Service",
            price: 35,
            description: "Complete boat interior and exterior detailing",
            pricingType: "perFoot",
            includes: ["Boat Interior Services", "Boat Exterior Services"]
          },
          {
            id: "boat-interior",
            name: "Boat Interior Only",
            price: 19,
            description: "Boat interior detailing only",
            pricingType: "perFoot",
            includes: ["Boat Interior Services"]
          },
          {
            id: "boat-exterior",
            name: "Boat Exterior Only",
            price: 23,
            description: "Boat exterior detailing only",
            pricingType: "perFoot",
            includes: ["Boat Exterior Services"]
          }
        ],
        additionalServices: [
          { id: "boat-uv-protection", name: "UV Protection Coating", price: 149, description: "Premium UV protection for marine environment" },
          { id: "boat-mildew-treatment", name: "Mildew Treatment", price: 74, description: "Anti-mildew treatment for marine conditions" }
        ]
      },
      {
        id: "jet-ski",
        name: "Jet Ski Detailing",
        vehicleTypes: ["jet-ski"],
        packages: [
          {
            id: "jet-ski-full",
            name: "Jet Ski Full Detailing",
            price: 35,
            description: "Complete jet ski detailing package (priced per foot)",
            pricingType: "perFoot", // changed to perFoot as requested
            includes: ["Jet Ski Exterior Services", "Jet Ski Interior/Functional Areas"]
          }
        ],
        additionalServices: [
          { id: "jet-ski-rust-protection", name: "Rust Protection", price: 59, description: "Anti-rust treatment for saltwater protection" }
        ]
      },
      {
        id: "rv",
        name: "RV Detailing",
        vehicleTypes: ["rv"],
        packages: [
          {
            id: "rv-full",
            name: "Full RV Service",
            price: 39,
            description: "Complete RV interior and exterior detailing",
            pricingType: "perFoot",
            includes: ["RV Interior Services", "RV Exterior Services"]
          },
          {
            id: "rv-interior",
            name: "RV Interior Only",
            price: 25,
            description: "RV interior detailing only",
            pricingType: "perFoot",
            includes: ["RV Interior Services"]
          },
          {
            id: "rv-exterior",
            name: "RV Exterior Only",
            price: 25,
            description: "RV exterior detailing only",
            pricingType: "perFoot",
            includes: ["RV Exterior Services"]
          }
        ],
        additionalServices: [
          { id: "rv-roof-treatment", name: "Roof Sealant Treatment", price: 119, description: "Professional roof sealing and protection" },
          { id: "rv-tank-cleaning", name: "Water Tank Cleaning", price: 79, description: "Fresh water tank cleaning and sanitization" }
        ]
      },
      {
        id: "motorcycle",
        name: "Motorcycle Detailing",
        vehicleTypes: ["motorcycle"],
        packages: [
          {
            id: "bike-full",
            name: "Full Bike Detailing",
            price: 169,
            description: "Complete motorcycle detailing package",
            pricingType: "fixed",
            includes: ["Bike Exterior Services", "Bike Detailing & Protection"]
          },
          {
            id: "bike-basic",
            name: "Basic Bike Detailing",
            price: 129,
            description: "Basic motorcycle cleaning and detailing",
            pricingType: "fixed",
            includes: ["Basic Exterior Cleaning", "Basic Protection"]
          },
          {
            id: "bike-premium",
            name: "Premium Bike Detailing",
            price: 199,
            description: "Premium motorcycle detailing with ceramic coating",
            pricingType: "fixed",
            includes: ["Complete Detailing", "Ceramic Coating", "Chrome Polish"]
          }
        ],
        additionalServices: [
          { id: "bike-chain-service", name: "Chain Service", price: 29, description: "Complete chain cleaning and lubrication" },
          { id: "bike-chrome-polish", name: "Chrome Polish", price: 44, description: "Premium chrome polishing and protection" },
          { id: "bike-engine-detail", name: "Engine Detailing", price: 59, description: "Detailed engine cleaning and degreasing" }
        ]
      }
    ]
  },

  // ✅ CHIMNEY SERVICES
  CHIMNEY: {
    id: "chimney",
    name: "Chimney Cleaning",
    icon: "Home",
    services: [
      {
        id: "basic-chimney-cleaning",
        name: "Basic Chimney Cleaning",
        packages: [
          {
            id: "chimney-basic",
            name: "Basic Package",
            price: 2500,
            description: "Standard chimney cleaning service",
            pricingType: "fixed",
          },
          {
            id: "chimney-premium",
            name: "Premium Package",
            price: 3500,
            description: "Premium chimney cleaning with inspection",
            pricingType: "fixed",
          },
          {
            id: "chimney-deluxe",
            name: "Deluxe Package",
            price: 4500,
            description: "Complete chimney cleaning and repair",
            pricingType: "fixed",
          }
        ],
        additionalServices: [
          { id: "chimney-inspection", name: "Safety Inspection", price: 200 },
          { id: "chimney-repair", name: "Repair Work", price: 500 },
          { id: "chimney-certification", name: "Certification", price: 100 }
        ],
        // Chimney specific fields
        chimneyTypes: [
          { id: "brick-chimney", name: "Brick Chimney" },
          { id: "metal-chimney", name: "Metal Chimney" },
          { id: "stone-chimney", name: "Stone Chimney" }
        ],
        chimneySizes: [
          { id: "small", name: "Small (Up to 20ft)" },
          { id: "medium", name: "Medium (20-40ft)" },
          { id: "large", name: "Large (40ft+)" }
        ]
      }
    ]
  },

  // ✅ DUCK CLEANING SERVICES
  "DUCK-CLEANING": {
    id: "duck-cleaning",
    name: "Duck Cleaning",
    icon: "Bird",
    services: [
      {
        id: "pond-maintenance",
        name: "Pond Maintenance",
        packages: [
          {
            id: "duck-basic",
            name: "Basic Package",
            price: 1500,
            description: "Basic pond cleaning and maintenance",
            pricingType: "fixed",
          },
          {
            id: "duck-premium",
            name: "Premium Package",
            price: 2500,
            description: "Premium pond cleaning with water testing",
            pricingType: "fixed",
          },
          {
            id: "duck-deluxe",
            name: "Deluxe Package",
            price: 3500,
            description: "Complete pond ecosystem maintenance",
            pricingType: "fixed",
          }
        ],
        additionalServices: [
          { id: "water-testing", name: "Water Testing", price: 100 },
          { id: "algae-removal", name: "Algae Removal", price: 300 },
          { id: "feeding-service", name: "Feeding Service", price: 150 },
          { id: "health-check", name: "Health Check", price: 200 }
        ],
        // Duck cleaning specific fields
        areaSizes: [
          { id: "small-pond", name: "Small Pond" },
          { id: "medium-pond", name: "Medium Pond" },
          { id: "large-pond", name: "Large Pond" },
          { id: "lake", name: "Lake" }
        ]
      }
    ]
  }
};

/* ---------------------- VENDORS LIST ---------------------- */
export const VENDORS = [
  "AutoClean Experts",
  "Chimney Masters",
  "Pond Care Services",
  "Family Auto Care",
  "Industrial Chimney Solutions",
  "Premium Detailing Pro",
  "Mobile Wash Team"
];

/* ---------------------- TIME SLOTS ---------------------- */
export const TIME_SLOTS = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00"
];