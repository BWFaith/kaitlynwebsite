/* ============ SITE SETTINGS: edit these ============ */
window.SITE = {
  name: 'Kaitlyn Benedetto',
  brand: 'Keys by Kait',
  tag: 'Licensed Real Estate Agent',
  brokerage: 'River Hills Properties, LLC',
  email: 'KeysByKaitB@gmail.com',      // all searches and enquiries are delivered here
  phone: '315-825-1233',
  addr: '8539 Turin Road, Rome, NY',
  fb: 'https://www.facebook.com/KeysByKait',
  areas: ['New Hartford', 'Rome', 'Utica', 'Old Forge', 'Barneveld', 'Remsen', 'Boonville', 'Holland Patent', 'Camden']
};
window.$ = (s, c = document) => c.querySelector(s);
window.$$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ============ SAMPLE LISTINGS: replace with real properties ============
   Images: overwrite the files in /images/listings/ using the same names (id-1.jpg, id-2.jpg ...),
   or change the paths. type: house | apartment | condo | land. status: sale | rent. n = number of photos. */
const mk = (id, title, addr, city, type, status, price, beds, baths, sqft, year, feat, desc, tag, acres, n = 4) => ({
  id, title, addr, city, type, status, price, beds, baths, sqft, year, feat, desc, tag, acres,
  img: Array.from({ length: n }, (_, i) => `images/listings/${id}-${i + 1}.jpg`)
});
window.LISTINGS = [
  mk('poolside-family-home', 'Poolside Family Home', '100 Sample Lane', 'New Hartford', 'house', 'sale', 389900, 4, 2.5, 2650, 1978, ['Pool', 'Garage', 'Fireplace', 'Garden'], 'Cozy nights by the fireplace and summer days by the pool. A beautifully kept home with a covered patio, a fenced backyard and plenty of room to entertain.', 'Featured', 0, 6),
  mk('classic-white-farmhouse', 'Classic White Farmhouse', '200 Sample Road', 'Remsen', 'house', 'sale', 274900, 3, 2, 2100, 1920, ['Garden', 'Fireplace', 'Pet friendly'], 'A charming farmhouse with a wraparound porch, original details and a generous yard.', 'New'),
  mk('pillmore-ranch', 'Ranch on Pillmore Drive', '6364 Pillmore Dr', 'Rome', 'house', 'sale', 329900, 3, 2, 1500, 1965, ['Garage', 'Garden'], 'A well-kept ranch on a large, level lot. Open house Sunday 11/1, 12:00 to 2:00 PM. (Bedrooms, baths and size are placeholders: edit in js/data.js.)', 'Open house'),
  mk('adirondack-retreat', 'Adirondack Retreat', '300 Sample Trail', 'Old Forge', 'house', 'sale', 465000, 3, 2, 2200, 2002, ['Fireplace', 'Lake view', 'Garage'], 'A warm lodge-style home minutes from the lakes, with a stone fireplace and a deck made for fall evenings.', 'Featured'),
  mk('holland-patent-colonial', 'Holland Patent Colonial', '400 Sample Street', 'Holland Patent', 'house', 'sale', 359000, 4, 2.5, 2400, 1998, ['Garage', 'Garden', 'Fireplace'], 'A spacious colonial in a quiet neighborhood with an updated kitchen and a private backyard.', ''),
  mk('utica-two-bed', 'Utica Two-Bedroom Apartment', '500 Sample Avenue, Unit 2', 'Utica', 'apartment', 'rent', 1150, 2, 1, 900, 1950, ['Pet friendly'], 'A bright, updated two-bedroom apartment close to shops, parks and the highway.', 'For rent'),
  mk('rome-downtown-apt', 'Downtown Rome Apartment', '600 Sample Street, Unit 4', 'Rome', 'apartment', 'rent', 975, 1, 1, 700, 1930, ['Pet friendly'], 'A cozy one-bedroom apartment within walking distance of restaurants and local shops.', 'For rent'),
  mk('new-hartford-townhome', 'New Hartford Townhome', '700 Sample Court, Unit 8', 'New Hartford', 'condo', 'sale', 219000, 2, 1.5, 1300, 2006, ['Garage', 'Pet friendly'], 'A low-maintenance townhome with an attached garage, a private patio and easy access to everything.', ''),
  mk('boonville-acreage', 'Boonville Acreage', 'Sample Hill Road', 'Boonville', 'land', 'sale', 89000, 0, 0, 0, 0, ['Lake view'], 'Over 12 acres of open and wooded land, a peaceful setting for a homestead or hunting camp.', 'Land', 12)
];
