-- Sample data for testing the enhanced content tables
-- Run this after setting up the tables with supabase-content-setup.sql

-- Insert sample notes with images
INSERT INTO notes (subject_name, subject_code, scheme, semester, class, file_url, thumbnail_url, uploaded_by, description, tags, download_count, view_count, file_size, page_count) VALUES
('Advanced Mathematics', 'MATH12', '2025', NULL, '12', '/notes/math12.pdf', '/thumbnails/math.jpg', 'IgniteVidya Faculty', 'Comprehensive calculus and algebra notes for Class 12', ARRAY['calculus', 'algebra', 'mathematics'], 145, 523, '2.5 MB', 85),
('Organic Chemistry', 'CHEM11', '2025', NULL, '11', '/notes/chem11.pdf', '/thumbnails/chemistry.jpg', 'IgniteVidya Faculty', 'Complete organic chemistry notes with reactions', ARRAY['chemistry', 'organic', 'reactions'], 98, 412, '3.2 MB', 102),
('Physics - Mechanics', 'PHYS11', '2025', NULL, '11', '/notes/phys11.pdf', '/thumbnails/physics.jpg', 'IgniteVidya Faculty', 'Mechanics, kinematics, and Newton''s laws explained', ARRAY['physics', 'mechanics', 'kinematics'], 167, 678, '2.8 MB', 95),
('Biology - Genetics', 'BIOL12', '2024', NULL, '12', '/notes/bio12.pdf', '/thumbnails/biology.jpg', 'IgniteVidya Faculty', 'Genetics, heredity, and DNA structure notes', ARRAY['biology', 'genetics', 'DNA'], 89, 345, '2.1 MB', 72),
('Computer Science', 'CS12', '2025', NULL, '12', '/notes/cs12.pdf', '/thumbnails/computer.jpg', 'IgniteVidya Faculty', 'Python programming and data structures', ARRAY['programming', 'python', 'data-structures'], 234, 891, '3.5 MB', 120),
('English Literature', 'ENG10', '2024', NULL, '10', '/notes/eng10.pdf', '/thumbnails/english.jpg', 'IgniteVidya Faculty', 'Shakespeare, poetry, and prose analysis', ARRAY['literature', 'shakespeare', 'poetry'], 76, 298, '1.8 MB', 65);

-- Insert sample comments for notes
INSERT INTO notes_comments (note_id, text, author, created_at) 
SELECT id, 'Excellent calculus examples! Very helpful for board exams.', 'Math Student', '2025-01-10T10:30:00Z'
FROM notes WHERE subject_code = 'MATH12';

INSERT INTO notes_comments (note_id, text, author, created_at)
SELECT id, 'Could you add more solved problems on kinematics?', 'Physics Student', '2025-01-08T14:20:00Z'
FROM notes WHERE subject_code = 'PHYS11';

INSERT INTO notes_comments (note_id, text, author, created_at)
SELECT id, 'Great explanation of Newton''s laws!', 'Science Student', '2025-01-09T09:15:00Z'
FROM notes WHERE subject_code = 'PHYS11';

-- Insert sample question papers
INSERT INTO question_papers (subject_code, subject_name, year, semester, branch, exam_type, file_url, thumbnail_url, uploaded_by, description, tags, download_count, view_count, file_size) VALUES
('MATH12', 'Advanced Mathematics', 2024, 2, 'Science', 'Board Exam', '/papers/math12-2024.pdf', '/thumbnails/paper-math.jpg', 'IgniteVidya Faculty', '2024 Board examination paper', ARRAY['board-exam', '2024', 'mathematics'], 234, 567, '1.2 MB'),
('PHYS11', 'Physics', 2024, 1, 'Science', 'Mid-term', '/papers/phys11-2024.pdf', '/thumbnails/paper-physics.jpg', 'IgniteVidya Faculty', 'Mid-term examination 2024', ARRAY['mid-term', 'physics'], 156, 423, '0.9 MB'),
('CHEM11', 'Chemistry', 2024, 1, 'Science', 'Final', '/papers/chem11-2024.pdf', '/thumbnails/paper-chemistry.jpg', 'IgniteVidya Faculty', 'Final examination paper', ARRAY['final-exam', 'chemistry'], 189, 501, '1.1 MB');

-- Insert sample lab programs
INSERT INTO lab_programs (lab_title, program_number, description, code, expected_output, semester, language, difficulty, thumbnail_url, tags, view_count) VALUES
('Array Sorting', 1, 'Implement bubble sort algorithm', 'def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr', '[1, 2, 3, 4, 5]', 3, 'Python', 'Easy', '/thumbnails/lab-sorting.jpg', ARRAY['sorting', 'arrays', 'algorithms'], 345),
('Binary Search', 2, 'Implement binary search algorithm', 'def binary_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1', 'Element found at index 3', 3, 'Python', 'Medium', '/thumbnails/lab-search.jpg', ARRAY['searching', 'binary-search', 'algorithms'], 289),
('Linked List', 3, 'Implement singly linked list', 'class Node:\n    def __init__(self, data):\n        self.data = data\n        self.next = None\n\nclass LinkedList:\n    def __init__(self):\n        self.head = None', 'Linked list created successfully', 4, 'Python', 'Medium', '/thumbnails/lab-linkedlist.jpg', ARRAY['data-structures', 'linked-list'], 412);

-- Insert sample projects
INSERT INTO projects (title, description, domain, github_url, source_url, thumbnail_url, cover_image_url, tags, difficulty, tech_stack, features, view_count, star_count) VALUES
('E-Commerce Platform', 'Full-stack e-commerce website with payment integration', 'Web Development', 'https://github.com/example/ecommerce', 'https://demo.ecommerce.com', '/thumbnails/project-ecommerce.jpg', '/covers/project-ecommerce-cover.jpg', ARRAY['ecommerce', 'fullstack', 'payment'], 'Hard', ARRAY['React', 'Node.js', 'MongoDB', 'Stripe'], ARRAY['User authentication', 'Product catalog', 'Shopping cart', 'Payment gateway', 'Order tracking'], 567, 89),
('Weather App', 'Real-time weather application using OpenWeather API', 'Web Development', 'https://github.com/example/weather', 'https://demo.weather.com', '/thumbnails/project-weather.jpg', '/covers/project-weather-cover.jpg', ARRAY['weather', 'api', 'react'], 'Easy', ARRAY['React', 'OpenWeather API', 'CSS'], ARRAY['Current weather', 'Forecast', 'Location search', 'Responsive design'], 423, 67),
('Task Manager', 'Productivity app for managing daily tasks', 'Web Development', 'https://github.com/example/taskmanager', 'https://demo.taskmanager.com', '/thumbnails/project-tasks.jpg', '/covers/project-tasks-cover.jpg', ARRAY['productivity', 'tasks', 'crud'], 'Medium', ARRAY['Vue.js', 'Firebase', 'Tailwind CSS'], ARRAY['Create tasks', 'Set priorities', 'Due dates', 'Categories', 'Dark mode'], 389, 54),
('AI Chatbot', 'Intelligent chatbot using natural language processing', 'AI/ML', 'https://github.com/example/chatbot', NULL, '/thumbnails/project-chatbot.jpg', '/covers/project-chatbot-cover.jpg', ARRAY['ai', 'nlp', 'chatbot'], 'Hard', ARRAY['Python', 'TensorFlow', 'Flask', 'React'], ARRAY['Natural language understanding', 'Context awareness', 'Multi-language support', 'Learning capability'], 678, 123),
('Portfolio Website', 'Personal portfolio template with animations', 'Web Development', 'https://github.com/example/portfolio', 'https://demo.portfolio.com', '/thumbnails/project-portfolio.jpg', '/covers/project-portfolio-cover.jpg', ARRAY['portfolio', 'template', 'animations'], 'Easy', ARRAY['HTML', 'CSS', 'JavaScript', 'GSAP'], ARRAY['Smooth animations', 'Responsive design', 'Contact form', 'Project showcase'], 512, 78);

-- Add some comments to question papers
INSERT INTO question_papers_comments (paper_id, text, author, created_at)
SELECT id, 'Very helpful for exam preparation!', 'Student', '2025-01-05T10:00:00Z'
FROM question_papers WHERE subject_code = 'MATH12' LIMIT 1;

INSERT INTO question_papers_comments (paper_id, text, author, created_at)
SELECT id, 'Could you upload the answer key as well?', 'Physics Student', '2025-01-06T14:30:00Z'
FROM question_papers WHERE subject_code = 'PHYS11' LIMIT 1;
