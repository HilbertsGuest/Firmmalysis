import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, BarChart3, Building2, 
  FileText, ChevronRight, TrendingUp, 
  Users, Euro, Download, Filter 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

// --- MOCK DATA GENERATOR ---
// In a real app, this would come from an API like North Data or OpenRegister
const CITIES = {
  "Aachen": { lat: 50.7753, lon: 6.0839 },
  "Köln": { lat: 50.9375, lon: 6.9603 },
  "Düsseldorf": { lat: 51.2277, lon: 6.7735 },
  "Berlin": { lat: 52.5200, lon: 13.4050 }
};

const GENERATE_COMPANIES = () => [
  { id: 1, name: "AixTech Solutions GmbH", city: "Aachen", lat: 50.7760, lon: 6.0840, capital: 25000, employees: 12, founded: 2019, industry: "Software", status: "Active", revenue: [1.2, 1.5, 2.1, 2.8], score: 88 },
  { id: 2, name: "Westfalen Logistics AG", city: "Eschweiler", lat: 50.8200, lon: 6.2600, capital: 150000, employees: 120, founded: 2005, industry: "Logistics", status: "Active", revenue: [15, 16, 15.5, 18], score: 94 },
  { id: 3, name: "Euregio Handwerk UG", city: "Stolberg", lat: 50.7667, lon: 6.2333, capital: 1000, employees: 4, founded: 2021, industry: "Construction", status: "Liquidation", revenue: [0.4, 0.3, 0.1, 0], score: 25 },
  { id: 4, name: "Rheinland Media Group", city: "Köln", lat: 50.9300, lon: 6.9500, capital: 50000, employees: 45, founded: 2010, industry: "Marketing", status: "Active", revenue: [4.5, 4.8, 5.2, 6.0], score: 76 },
  { id: 5, name: "Future Mobility Systems", city: "Aachen", lat: 50.7800, lon: 6.0700, capital: 55000, employees: 30, founded: 2018, industry: "Automotive", status: "Active", revenue: [2.0, 3.5, 5.0, 8.2], score: 91 },
  { id: 6, name: "Düren Paper Mill", city: "Düren", lat: 50.8000, lon: 6.4800, capital: 500000, employees: 200, founded: 1985, industry: "Manufacturing", status: "Active", revenue: [25, 24, 26, 27], score: 82 },
  { id: 7, name: "Startup Hero GmbH", city: "Herzogenrath", lat: 50.8667, lon: 6.1000, capital: 25000, employees: 8, founded: 2022, industry: "Tech", status: "Active", revenue: [0.1, 0.5, 0.8, 1.2], score: 65 },
];

// --- GEOSPATIAL LOGIC ---
// Haversine formula to calculate distance between two coords in km
const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

// --- COMPONENTS ---

const Sidebar = () => (
  <div className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0">
    <div className="p-6 flex items-center space-x-2 border-b border-slate-800">
      <Building2 className="text-blue-400" />
      <span className="font-bold text-xl tracking-tight">RegisterScout</span>
    </div>
    <nav className="flex-1 p-4 space-y-2">
      <NavItem icon={<Search size={20} />} label="Search Register" active />
      <NavItem icon={<BarChart3 size={20} />} label="Market Analysis" />
      <NavItem icon={<MapPin size={20} />} label="Geofencing" />
      <NavItem icon={<FileText size={20} />} label="Reports" />
    </nav>
    <div className="p-4 border-t border-slate-800">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">JD</div>
        <div className="text-sm">
          <p className="font-medium">John Doe</p>
          <p className="text-slate-400 text-xs">Enterprise Plan</p>
        </div>
      </div>
    </div>
  </div>
);

const NavItem = ({ icon, label, active }) => (
  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </div>
);

const ScoreBadge = ({ score }) => {
  let color = "bg-red-100 text-red-700";
  if (score >= 80) color = "bg-green-100 text-green-700";
  else if (score >= 50) color = "bg-yellow-100 text-yellow-700";
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${color}`}>
      Score: {score}
    </span>
  );
};

const CompanyDetail = ({ company, onClose }) => {
  if (!company) return null;

  const chartData = company.revenue.map((rev, index) => ({
    year: 2020 + index,
    revenue: rev
  }));

  return (
    <div className="fixed right-0 top-0 h-screen w-1/3 bg-white shadow-2xl border-l border-gray-200 p-8 overflow-y-auto z-50 animate-in slide-in-from-right duration-300">
      <button onClick={onClose} className="mb-6 text-gray-500 hover:text-gray-900 font-medium flex items-center">
        <ChevronRight className="rotate-180 mr-1" size={16} /> Back to list
      </button>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{company.name}</h2>
          <p className="text-slate-500 flex items-center mt-1"><MapPin size={14} className="mr-1"/> {company.city}</p>
        </div>
        <ScoreBadge score={company.score} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Stammkapital</div>
          <div className="text-xl font-bold text-slate-800">€{company.capital.toLocaleString()}</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Employees</div>
          <div className="text-xl font-bold text-slate-800">{company.employees}</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Founded</div>
          <div className="text-xl font-bold text-slate-800">{company.founded}</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-slate-500 text-xs uppercase font-semibold mb-1">Status</div>
          <div className={`text-xl font-bold ${company.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>{company.status}</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center"><TrendingUp size={18} className="mr-2 text-blue-500"/> Revenue Est. (Mio €)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="year" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-blue-900 mb-2">Register Extract Analysis</h4>
        <p className="text-sm text-blue-800 mb-4">
          This entity shows stable growth. Based on HRB entry 4021, no liquidity issues reported. High potential B2B lead.
        </p>
        <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium">
          <Download size={16} className="mr-2" /> Download Full Handelsregister Report
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function RegisterScout() {
  const [selectedCity, setSelectedCity] = useState("Aachen");
  const [radius, setRadius] = useState(50);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const companies = useMemo(() => GENERATE_COMPANIES(), []);

  // Filter Logic
  const filteredCompanies = useMemo(() => {
    const center = CITIES[selectedCity];
    if (!center) return [];

    return companies
      .map(company => {
        const dist = getDistanceFromLatLonInKm(center.lat, center.lon, company.lat, company.lon);
        return { ...company, distance: dist.toFixed(1) };
      })
      .filter(c => c.distance <= radius)
      .sort((a, b) => b.score - a.score); // Sort by Value/Score
  }, [selectedCity, radius, companies]);

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans text-slate-900">
      <Sidebar />
      
      <div className="ml-64 flex-1 p-8">
        {/* Header Area */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Commercial Register Search</h1>
            <p className="text-slate-500 mt-1">Find and analyze B2B prospects based on registry data.</p>
          </div>
          <div className="flex items-center space-x-3">
             <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                <Filter size={16} className="mr-2" /> Advanced Filters
             </button>
          </div>
        </div>

        {/* Search Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8 flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Center Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
              <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
              >
                {Object.keys(CITIES).map(city => (
                  <option key={city} value={city}>{city}, Germany</option>
                ))}
              </select>
            </div>
          </div>

          <div className="w-48">
             <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Radius (+km)</label>
             <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
               <input 
                 type="number" 
                 value={radius}
                 onChange={(e) => setRadius(Number(e.target.value))}
                 className="bg-transparent w-full outline-none text-slate-900"
               />
               <span className="text-gray-400 text-sm font-medium">km</span>
             </div>
          </div>

          <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-sm shadow-blue-200">
            Update Results
          </button>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Companies Found <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-sm ml-2">{filteredCompanies.length}</span></h3>
            <div className="text-sm text-gray-500">Sorted by: <span className="font-medium text-gray-800">Lead Value (High to Low)</span></div>
          </div>
          
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Company Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Industry</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stammkapital</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Value Score</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCompanies.map((company) => (
                <tr 
                  key={company.id} 
                  onClick={() => setSelectedCompany(company)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors group ${selectedCompany?.id === company.id ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{company.name}</div>
                    <div className="text-xs text-slate-500">HRB {10000 + company.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700">{company.city}</div>
                    <div className="text-xs text-slate-400">{company.distance} km away</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{company.industry}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-mono">€{company.capital.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <ScoreBadge score={company.score} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight className="inline-block text-gray-300 group-hover:text-blue-500" size={20} />
                  </td>
                </tr>
              ))}
              {filteredCompanies.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No companies found in this radius. Try increasing the range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel Overlay */}
      {selectedCompany && (
        <CompanyDetail company={selectedCompany} onClose={() => setSelectedCompany(null)} />
      )}
    </div>
  );
}