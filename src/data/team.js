// Leadership team. To change a person, edit name/role here. To swap a photo, replace the image file in
// src/assets/team/ (keep the file name) or point `photo` at a new import. Photos display in a 4:5 frame
// (portrait, cropped from the top), so a head-and-shoulders photo with some room above the head works best.
import president from '../assets/team/president.jpg'
import vicePresident from '../assets/team/vice-president.jpg'
import treasurer from '../assets/team/treasurer.jpg'
import technicalLead from '../assets/team/technical-lead.jpg'

export const TEAM = [
  { id: 'president', role: 'President', name: 'Om Gupta', photo: president },
  { id: 'vice-president', role: 'Vice President', name: 'Ankit Timilsena', photo: vicePresident },
  { id: 'treasurer', role: 'Treasurer', name: 'Manish Kumar Shah', photo: treasurer },
  { id: 'technical-lead', role: 'Technical Lead', name: 'Michael Shah', photo: technicalLead },
]
