(let ((person '((name . "Alice") (age . 30) (city . "New York"))))
  (assoc 'age person))

(let ((person '((. name "Alice") (. age 30) (. city "New York"))))
  (assoc 'age person))