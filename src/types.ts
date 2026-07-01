export interface Appointment {
  id: string;
  patientId?: string; // reference to patient account if logged in
  name: string;
  phone: string;
  service: string;
  doctor: string;
  date: string;
  time: string;
  notes?: string;
  createdAt: string;
  status: 'confirmed' | 'pending';
}

export interface Patient {
  id: string; // Account Number, e.g., PAT-102040
  name: string;
  phone: string;
  email: string;
  password?: string;
  createdAt: string;
  medicalHistory: string[]; // Treatment treatments list (e.g. ['زراعة ضرس علوي أيسر', 'تنظيف جير تجميلي'])
  caseStatus: string; // e.g., 'نشط' | 'متابعة دورية' | 'تم الانتهاء' | 'تحت المعاينة والاستشارة'
  clinicalNotes?: string; // Private doctor's clinic observations
}

export interface Service {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  iconName: string;
  detailsAr: string[];
  duration: string;
}

export interface Doctor {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  image: string;
  bioAr: string;
  bioEn: string;
  experience: string;
  certificates: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  treatment: string;
  quote: string;
  rating: number;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}
