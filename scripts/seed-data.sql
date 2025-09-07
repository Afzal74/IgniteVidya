-- Insert sample notes
INSERT INTO notes (subject_name, subject_code, scheme, semester, file_url, uploaded_by) VALUES
('Engineering Mathematics I', '21MAT11', '2021', 1, '/sample-notes.pdf', 'Admin'),
('Physics for Engineers', '21PHY12', '2021', 1, '/sample-notes.pdf', 'Admin'),
('Programming in C', '21CSL15', '2021', 1, '/sample-notes.pdf', 'Admin'),
('Engineering Chemistry', '21CHE12', '2021', 1, '/sample-notes.pdf', 'Admin'),
('Elements of Civil Engineering', '21CIV14', '2021', 1, '/sample-notes.pdf', 'Admin');

-- Insert sample question papers
INSERT INTO question_papers (subject_code, subject_name, year, semester, branch, file_url) VALUES
('21MAT11', 'Engineering Mathematics I', 2023, 1, 'CSE', '/sample-qp.pdf'),
('21PHY12', 'Physics for Engineers', 2023, 1, 'CSE', '/sample-qp.pdf'),
('21CSL15', 'Programming in C', 2023, 1, 'CSE', '/sample-qp.pdf'),
('21MAT21', 'Engineering Mathematics II', 2023, 2, 'CSE', '/sample-qp.pdf'),
('21CSL25', 'Data Structures', 2023, 2, 'CSE', '/sample-qp.pdf');

-- Insert sample lab programs
INSERT INTO lab_programs (lab_title, program_number, description, code, expected_output, semester) VALUES
('C Programming Lab', 1, 'Write a C program to find the sum of two numbers', 
'#include <stdio.h>
int main() {
    int a, b, sum;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    sum = a + b;
    printf("Sum = %d", sum);
    return 0;
}', 
'Enter two numbers: 5 3
Sum = 8', 1),

('C Programming Lab', 2, 'Write a C program to check if a number is prime', 
'#include <stdio.h>
int main() {
    int n, i, flag = 0;
    printf("Enter a number: ");
    scanf("%d", &n);
    for(i = 2; i <= n/2; ++i) {
        if(n % i == 0) {
            flag = 1;
            break;
        }
    }
    if(flag == 0)
        printf("%d is a prime number", n);
    else
        printf("%d is not a prime number", n);
    return 0;
}', 
'Enter a number: 7
7 is a prime number', 1);

-- Insert sample projects
INSERT INTO projects (title, description, domain, github_url) VALUES
('Student Management System', 'A web-based system to manage student records, attendance, and grades', 'Web Development', 'https://github.com/example/student-management'),
('Weather Prediction using ML', 'Machine learning model to predict weather patterns using historical data', 'Machine Learning', 'https://github.com/example/weather-prediction'),
('IoT Home Automation', 'Smart home system using Arduino and sensors for automation', 'IoT', 'https://github.com/example/home-automation'),
('E-commerce Mobile App', 'React Native app for online shopping with payment integration', 'Mobile Development', 'https://github.com/example/ecommerce-app'),
('Blockchain Voting System', 'Secure voting system using blockchain technology', 'Blockchain', 'https://github.com/example/blockchain-voting');
