-- Add 50 demo medicines to pharmacy_inventory
INSERT INTO pharmacy_inventory (
    name, 
    category, 
    description, 
    price, 
    discount_percentage, 
    stock_quantity, 
    supplier_info
) VALUES
-- Pain Relief & Analgesics (10 medicines)
('Paracetamol 500mg', 'Pain Relief & Analgesics', 'Fast-acting pain reliever for headaches and fever', 50, 20, 500, 'Pharma Co Ltd'),
('Ibuprofen 400mg', 'Pain Relief & Analgesics', 'Anti-inflammatory pain relief for body aches', 80, 25, 400, 'MedSupply Inc'),
('Aspirin 75mg', 'Pain Relief & Analgesics', 'Low-dose aspirin for heart health', 45, 15, 600, 'HealthCare Pro'),
('Diclofenac Sodium 50mg', 'Pain Relief & Analgesics', 'Muscle and joint pain relief', 120, 30, 300, 'Pharma Co Ltd'),
('Naproxen 250mg', 'Pain Relief & Analgesics', 'Long-lasting pain and inflammation relief', 100, 20, 350, 'MedSupply Inc'),
('Tramadol 50mg', 'Pain Relief & Analgesics', 'Strong pain relief for moderate to severe pain', 180, 15, 200, 'HealthCare Pro'),
('Mefenamic Acid 500mg', 'Pain Relief & Analgesics', 'Period pain and menstrual cramps relief', 90, 25, 400, 'Women Health Pharma'),
('Codeine 30mg', 'Pain Relief & Analgesics', 'Prescription pain relief for severe pain', 250, 10, 150, 'MedSupply Inc'),
('Acetaminophen Extra Strength', 'Pain Relief & Analgesics', 'Extra strength pain and fever relief', 75, 30, 450, 'Pharma Co Ltd'),
('Ketorolac 10mg', 'Pain Relief & Analgesics', 'Fast-acting pain relief injection alternative', 150, 20, 250, 'Surgical Meds Inc'),

-- Antibiotics (10 medicines)
('Amoxicillin 500mg', 'Antibiotics', 'Broad-spectrum antibiotic for bacterial infections', 150, 40, 300, 'Antibiotic Labs'),
('Azithromycin 500mg', 'Antibiotics', 'Powerful antibiotic for respiratory infections', 200, 35, 250, 'MedSupply Inc'),
('Ciprofloxacin 500mg', 'Antibiotics', 'Antibiotic for urinary and GI infections', 180, 30, 280, 'Antibiotic Labs'),
('Doxycycline 100mg', 'Antibiotics', 'Versatile antibiotic for multiple infections', 120, 35, 320, 'HealthCare Pro'),
('Cephalexin 500mg', 'Antibiotics', 'Antibiotic for skin and respiratory infections', 140, 40, 350, 'MedSupply Inc'),
('Metronidazole 400mg', 'Antibiotics', 'Treatment for parasitic and bacterial infections', 100, 25, 400, 'Antibiotic Labs'),
('Clindamycin 300mg', 'Antibiotics', 'Antibiotic for serious bacterial infections', 220, 30, 200, 'HealthCare Pro'),
('Erythromycin 250mg', 'Antibiotics', 'Antibiotic alternative for penicillin allergy', 160, 35, 300, 'MedSupply Inc'),
('Trimethoprim 200mg', 'Antibiotics', 'Urinary tract infection treatment', 95, 40, 380, 'Antibiotic Labs'),
('Vancomycin 125mg', 'Antibiotics', 'Strong antibiotic for serious infections', 450, 20, 100, 'Prescription Meds'),

-- Cardiovascular Medicines (10 medicines)
('Atorvastatin 20mg', 'Cardiovascular', 'Cholesterol-lowering medication', 250, 50, 400, 'CardioCare Pharma'),
('Amlodipine 5mg', 'Cardiovascular', 'Blood pressure control medication', 180, 45, 450, 'MedSupply Inc'),
('Metoprolol 50mg', 'Cardiovascular', 'Beta-blocker for heart conditions', 120, 40, 500, 'CardioCare Pharma'),
('Losartan 50mg', 'Cardiovascular', 'ARB for hypertension treatment', 150, 45, 480, 'HealthCare Pro'),
('Aspirin 100mg EC', 'Cardiovascular', 'Enteric-coated aspirin for heart protection', 80, 50, 600, 'MedSupply Inc'),
('Digoxin 0.25mg', 'Cardiovascular', 'Heart failure and arrhythmia treatment', 200, 35, 350, 'CardioCare Pharma'),
('Warfarin 5mg', 'Cardiovascular', 'Blood thinner for stroke prevention', 100, 40, 420, 'MedSupply Inc'),
('Clopidogrel 75mg', 'Cardiovascular', 'Anti-platelet medication for heart', 220, 50, 380, 'CardioCare Pharma'),
('Enalapril 10mg', 'Cardiovascular', 'ACE inhibitor for high blood pressure', 140, 45, 440, 'HealthCare Pro'),
('Carvedilol 25mg', 'Cardiovascular', 'Beta-blocker for heart failure', 170, 40, 410, 'CardioCare Pharma'),

-- Diabetes Medicines (10 medicines)
('Metformin 500mg', 'Diabetes', 'First-line type 2 diabetes treatment', 60, 50, 800, 'Diabetic Care Inc'),
('Glibenclamide 5mg', 'Diabetes', 'Diabetes medication to lower blood sugar', 50, 40, 700, 'MedSupply Inc'),
('Gliclazide 80mg', 'Diabetes', 'Oral diabetes medication', 70, 45, 650, 'Diabetic Care Inc'),
('Insulin Glargine 100IU', 'Diabetes', 'Long-acting insulin for diabetes', 800, 30, 300, 'HealthCare Pro'),
('Pioglitazone 30mg', 'Diabetes', 'Diabetes medication improving insulin sensitivity', 180, 40, 420, 'Diabetic Care Inc'),
('Sitagliptin 100mg', 'Diabetes', 'DPP-4 inhibitor for type 2 diabetes', 300, 35, 380, 'MedSupply Inc'),
('Glimepiride 2mg', 'Diabetes', 'Diabetes medication stimulating insulin release', 65, 40, 720, 'Diabetic Care Inc'),
('Canagliflozin 100mg', 'Diabetes', 'SGLT-2 inhibitor for diabetes', 450, 30, 350, 'HealthCare Pro'),
('Acarbose 50mg', 'Diabetes', 'Diabetes medication delaying carb absorption', 120, 35, 580, 'Diabetic Care Inc'),
('Linagliptin 5mg', 'Diabetes', 'DPP-4 inhibitor for type 2 diabetes', 380, 40, 400, 'MedSupply Inc'),

-- Gastrointestinal Medicines (10 medicines)
('Omeprazole 20mg', 'Gastrointestinal', 'Acid reflux and ulcer treatment', 100, 50, 600, 'Digestive Health Inc'),
('Pantoprazole 40mg', 'Gastrointestinal', 'GERD and acid reflux relief', 120, 45, 550, 'MedSupply Inc'),
('Ranitidine 150mg', 'Gastrointestinal', 'Stomach acid reducer', 60, 40, 800, 'Digestive Health Inc'),
('Loperamide 2mg', 'Gastrointestinal', 'Diarrhea treatment and control', 45, 35, 900, 'MedSupply Inc'),
('Metoclopramide 10mg', 'Gastrointestinal', 'Nausea and vomiting treatment', 70, 40, 650, 'HealthCare Pro'),
('Dicyclomine 10mg', 'Gastrointestinal', 'Irritable bowel syndrome relief', 80, 35, 700, 'Digestive Health Inc'),
('Lactulose Syrup', 'Gastrointestinal', 'Constipation relief and bowel regulation', 150, 30, 500, 'MedSupply Inc'),
('Hyoscine Butylbromide 20mg', 'Gastrointestinal', 'Abdominal pain and cramping relief', 90, 40, 600, 'Digestive Health Inc'),
('Sucralfate 1g', 'Gastrointestinal', 'Ulcer treatment and protection', 130, 45, 520, 'HealthCare Pro'),
('Hydrotalcite 500mg', 'Gastrointestinal', 'Antacid for heartburn relief', 55, 50, 750, 'MedSupply Inc');

