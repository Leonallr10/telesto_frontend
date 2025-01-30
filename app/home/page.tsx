"use client"

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Brain, BarChart3, Database, ChevronDown,
  Menu, Home, Info, Handshake, FolderGit2,
  BookOpen, Video, PhoneCall, X, ZoomIn
} from 'lucide-react';

function NavigationPopover({ isOpen, onClose, items, position, label }) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      const popoverHeight = popoverRef.current?.offsetHeight || 0;
      const windowHeight = window.innerHeight;
      if (position + popoverHeight > windowHeight - 20) {
        position = windowHeight - popoverHeight - 20;
      }
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, position]);

  return (
    <div
      ref={popoverRef}
      className={`fixed left-16 bg-white rounded-lg shadow-xl z-50 w-64 border border-gray-100
        transform origin-top transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      style={{ top: `${position}px` }}
    >
      <div className="px-4 py-3 border-b border-gray-100 bg-blue-50 rounded-t-lg">
        <span className="font-medium text-blue-800 text-sm">{label}</span>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {items.map((item, index) => (
          <a
            key={index}
            href={`#${item.replace(/\s+/g, '-').toLowerCase()}`}
            className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200 group"
            onClick={(e) => {
              e.preventDefault();
              onClose();
              const target = document.getElementById(item.replace(/\s+/g, '-').toLowerCase());
              target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <span className="group-hover:ml-1 transition-all duration-200">{item}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

const IconButton = React.forwardRef(({ icon, label, isActive, isOpen, onClick }, ref) => (
  <button
    ref={ref}
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 text-gray-600 hover:text-blue-800
      transition-all duration-300 ${isActive ? 'bg-blue-50 text-blue-800' : ''}
      ${isOpen ? 'pr-3' : 'justify-center'}`}
  >
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center">
        <div className="transform transition-transform size-5">
          {React.cloneElement(icon, { className: 'size-5' })}
        </div>
        <span className={`ml-3 text-sm font-medium transition-all ${
          isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'
        }`}>
          {label}
        </span>
      </div>
      {isOpen && (
        <ChevronDown
          size={16}
          className={`ml-2 transition-transform ${isActive ? 'rotate-180' : ''}`}
        />
      )}
    </div>
  </button>
));

function ImageSlider({ images }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentImageIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
    </div>
  );
}

function ImageModal({ isOpen, onClose, imageUrl }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-7xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>
        <img src={imageUrl} alt="Enlarged view" className="w-full h-auto rounded-lg" />
      </div>
    </div>
  );
}

function BusinessCaseCard({ title, content, benefits, imageUrl }) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
      <div className="relative h-64 cursor-pointer group" onClick={() => setIsImageModalOpen(true)}>
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="text-white" size={32} />
        </div>
      </div>
      <div className="p-8">
        <h4 className="text-2xl font-bold text-blue-900 mb-4">{title}</h4>
        <p className="text-gray-700 mb-6">{content}</p>
        <div className="space-y-4">
          <h5 className="text-lg font-semibold text-blue-800">Business Benefits</h5>
          <ul className="space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imageUrl={imageUrl}
      />
    </div>
  );
}

export default function HomePage() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState(0);
  const iconRefs = useRef({});
  const navRef = useRef(null);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    setActiveDropdown(null);
  };

  const handleIconClick = (id, event) => {
    if (!isNavOpen) {
      const iconElement = iconRefs.current[id];
      if (iconElement) {
        const rect = iconElement.getBoundingClientRect();
        setPopoverPosition(rect.top);
      }
    }
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const mainMenuItems = [
    { id: 'home', label: 'HOME', icon: <Home /> },
    { id: 'about', label: 'ABOUT US', icon: <Info /> },
    { id: 'alliance', label: 'ALLIANCE & PARTNERS', icon: <Handshake /> },
    { id: 'projects', label: 'PROJECTS', icon: <FolderGit2 /> },
    { id: 'blog', label: 'BLOG', icon: <BookOpen /> },
    { id: 'media', label: 'MEDIA', icon: <Video /> },
    { id: 'contact', label: 'CONTACT US', icon: <PhoneCall /> }
  ];

  const dropdownMenus = [
    {
      id: 'team',
      icon: <Users />,
      label: 'Team Telesto',
      items: ['Advisor', 'Core Team', 'Consultant']
    },
    {
      id: 'subsurface',
      icon: <Brain />,
      label: 'Subsurface Consulting',
      items: ['Exploration and Appraisal', 'Field Development', 'Reservoir Management']
    },
    {
      id: 'portfolio',
      icon: <BarChart3 />,
      label: 'Portfolio Advisory',
      items: ['Portfolio Advisory', 'Value Assurance']
    },
    {
      id: 'ai',
      icon: <Database />,
      label: 'AI & Big Data Analytics',
      items: ['AI for Oil & Gas', 'Mature Field Solutions', 'Business Case']
    }
  ];

  const renderContentSection = (title, content, imageUrl, items = []) => (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h3 className="text-3xl font-bold text-blue-900">{title}</h3>
          <p className="text-gray-700 leading-relaxed">{content}</p>
          {items.length > 0 && (
            <ul className="space-y-3 mt-6">
              {items.map((item, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative h-[400px] rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      </div>
    </div>
  );

  const sections = {
    'exploration-and-appraisal': {
      title: "Finding Oil & Gas – Making the invisible visible",
      content: "As the era of easy-to-find oil and gas has come to an end, combining traditional approaches with new technologies can help detect reservoirs that were previously invisible. At Telesto Energy, we have a team of experienced professionals with proven track record of exploration successes by using geoscience imaging technology combined with traditional exploration methods.",
      image: "https://i.imgur.com/7UvwOuf.jpeg",
      items: [
        "Regional Studies and Play Definition",
        "Prospect Identification & Evaluation",
        "Prospect Maturation & Resource Assessment",
        "Appraisal and Uncertainty Reduction"
      ]
    },
    'field-development': {
      title: "Making the most of your discovery",
      content: "Reservoir studies forms the core of the service line offered by Telesto Energy. We are able to leverage and integrate our team's deep disciplinary foundation into robust static and dynamic reservoir models and FDP.",
      image: "https://i.imgur.com/g2jXijI.jpeg",
      items: [
        "Static and dynamic modeling",
        "Conceptual ADP/FDPs",
        "Comprehensive ADP/FDPs for an optimal development",
        "Optimisation of ADPs/FDPs through Implementation"
      ]
    },
    'reservoir-management': {
      title: "Making the Best out of your Reservoir",
      content: "Telesto Energy experts can help design reservoir management systems that integrate processes, software and personnel to enable client efficiently optimize production from their fields.",
      image: "https://i.imgur.com/lzBFMuw.png",
      items: [
        "Integrated production system modeling",
        "Production Optimisation",
        "Reservoir Management Plans",
        "Reserve booking & reporting"
      ]
    },
    'portfolio-advisory': {
      title: "Taking the right approach",
      content: "Value maximisation of company's assets requires right portfolio management. Telesto Energy provides oil and gas companies with a bridge between corporate strategy and operational planning. It allows companies to be more proactive and responsive to changing market and operational realities at each stage in the asset life cycle and at every level in the organization, from corporate planners to asset teams.",
      image: "https://i.imgur.com/Qcl1uni.png",
      items: [
        "Identify underperforming Assets",
        "Develop Corporate Strategy",
        "Farm in / Farm Out Solutions",
        "Portfolio Optimisation",
        "Due diligence"
      ]
    },
    'value-assurance': {
      title: "Get the Maximum",
      content: "Telesto Energy experts can help to ensure the client gets maximum value out of oil and gas investments.",
      image: "https://i.imgur.com/6GOpjis.png",
      items: [
        "Technical Audits",
        "Deep Dive Audits",
        "Reserve Assurance",
        "Reserve Booking",
        "Value Optimisation"
      ]
    }
  };

  const aiSection = {
    title: "Artificial Intelligence & Big Data Analytics for Oil & Gas",
    content: "Leveraging cutting-edge AI and Big Data technologies to revolutionize oil and gas operations, enabling smarter decisions and improved efficiency across the entire value chain.",
    images: [
      "https://i.imgur.com/TSrjopE.png",
      "https://i.imgur.com/O6rjxb2.png"
    ]
  };

  const businessCases = [
    {
      title: "Sick Well Analytics",
      content: "Telesto Energy's mature field solutions reduces the sick well inventory proactively and bring them back to production faster, improve productivity, and predict wells that are likely to be sick in the near future using big data analytics and artificial intelligence.",
      benefits: [
        "Production increase by 8 to 10 percent by reducing sick well inventory proactively",
        "10 to 15 percent Opex reduction per barrel",
        "6 to 9 months of time savings from initiation to implementation",
        "Fast and better decision making"
      ],
      imageUrl: "https://i.imgur.com/2zC7SNw.png"
    },
    {
      title: "Drilling Analytics",
      content: "Telesto Energy's drilling optimisation using big data analytics and AI reduces Non-Productive Time (NPT) drastically by integrated operation planning that minimises drilling and maintenance cost, improves drilling efficiency by real time root cause analysis and proactively predict failure during drilling operations.",
      benefits: [
        "Reduction of NPT by 30 to 50 percent and upto 12 to 15 percent of the well cost",
        "Predictive analytics to prevent equipment failures can save around 5-10% of the drilling cost",
        "Productivity improvement through 85 to 95 percent uptime of drilling operations with higher operational efficiency"
      ],
      imageUrl: "https://i.imgur.com/cm0PjvL.png"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <nav 
        ref={navRef}
        className={`fixed left-0 top-0 h-full bg-white shadow-sm transition-all duration-300
          ${isNavOpen ? 'w-64' : 'w-16'} z-50`}
      >
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <h1 className={`text-lg font-semibold text-blue-900 transition-opacity
            ${isNavOpen ? 'opacity-100' : 'opacity-0'}`}>
            Telesto Energy
          </h1>
          <button
            onClick={toggleNav}
            className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Menu className="size-5 text-blue-800" />
          </button>
        </div>

        <div className="h-[calc(100vh-76px)] overflow-y-auto custom-scrollbar">
          <div className="py-2 space-y-1">
            {mainMenuItems.map((item) => (
              <IconButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                isOpen={isNavOpen}
                onClick={() => {
                  const element = document.getElementById(item.id);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            ))}
          </div>

          <div className="border-t border-gray-100 py-2 space-y-1">
            {dropdownMenus.map((menu) => (
              <div key={menu.id} className="relative">
                <div ref={el => iconRefs.current[menu.id] = el}>
                  <IconButton
                    icon={menu.icon}
                    label={menu.label}
                    isActive={activeDropdown === menu.id}
                    isOpen={isNavOpen}
                    onClick={(e) => handleIconClick(menu.id, e)}
                  />
                </div>

                {isNavOpen && activeDropdown === menu.id && (
                  <div className="overflow-hidden transition-all duration-300">
                    {menu.items.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.replace(/\s+/g, '-').toLowerCase()}`}
                        className="block px-4 py-2 pl-12 text-sm text-gray-600 hover:bg-blue-50
                          hover:text-blue-800 transition-colors"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                )}

                {!isNavOpen && (
                  <NavigationPopover
                    isOpen={activeDropdown === menu.id}
                    onClose={() => setActiveDropdown(null)}
                    items={menu.items}
                    position={popoverPosition}
                    label={menu.label}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className={`flex-1 transition-all duration-300 ${
        isNavOpen ? 'ml-64' : 'ml-16'
      }`}>
        <section className="relative h-screen">
          <img
            src="https://i.imgur.com/Kfa4pSH.jpeg"
            alt="Energy Solutions"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white space-y-4 p-8">
              <h1 className="text-5xl font-bold">Telesto Energy</h1>
              <p className="text-xl max-w-2xl mx-auto">
                Pioneering the future of energy through innovative solutions and expertise
              </p>
            </div>
          </div>
        </section>

        <section id="ai-for-oil-&-gas" className="py-24 px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-blue-900">{aiSection.title}</h3>
                <p className="text-gray-700 leading-relaxed">{aiSection.content}</p>
              </div>
              <ImageSlider images={aiSection.images} />
            </div>
          </div>
        </section>

        <section id="business-case" className="py-24 px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-3xl font-bold text-blue-900 mb-12 text-center">Business Case Solutions</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {businessCases.map((businessCase, index) => (
                <BusinessCaseCard key={index} {...businessCase} />
              ))}
            </div>
          </div>
        </section>

        {Object.entries(sections).map(([id, section]) => (
          <section
            key={id}
            id={id}
            className="py-24 px-8 bg-white even:bg-gray-50"
          >
            {renderContentSection(
              section.title,
              section.content,
              section.image,
              section.items
            )}
          </section>
        ))}

        <footer className="bg-blue-900 text-white py-8 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p>©2025 TELESTO ENERGY. All rights reserved</p>
          </div>
        </footer>
      </main>
    </div>
  );
}