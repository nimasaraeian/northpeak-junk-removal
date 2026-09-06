export interface GalleryJob {
  id: string;
  service: string;
  location: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  beforeCaption: string;
  afterCaption: string;
}

export const galleryJobs: GalleryJob[] = [
  {
    id: "lynn-valley-garage",
    service: "Garage Cleanout",
    location: "Lynn Valley",
    beforeSrc: "/gallery/garage-before.png",
    afterSrc: "/gallery/garage-after.png",
    beforeAlt:
      "Cluttered Lynn Valley garage packed with stored projects before NorthPeak cleanout",
    afterAlt:
      "The same garage cleared, with parking and a clean work floor after NorthPeak junk removal",
    beforeCaption: "A decade of stored projects.",
    afterCaption: "Parking and a work floor again.",
  },
  {
    id: "downtown-office",
    service: "Commercial Cleanout",
    location: "Downtown Vancouver",
    beforeSrc: "/gallery/office-before.png",
    afterSrc: "/gallery/office-after.png",
    beforeAlt:
      "Cluttered Vancouver office filled with old computers, cables, and boxes before NorthPeak commercial junk removal",
    afterAlt:
      "The same office cleared and organized with an open work floor and mountain view after NorthPeak cleanout",
    beforeCaption: "Old hardware, buried desks.",
    afterCaption: "Room to think again.",
  },
];
