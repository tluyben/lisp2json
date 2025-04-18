(let ((person '((name . "Alice") (age . 30) (city . "New York"))))
  (assoc 'age person))

  
;; if we want to use this more lispy (in my taste), it should be; 
(let ((person '((. name "Alice") (. age 30) (. city "New York"))))
  (assoc 'age person))

;; which doesn't work, so which would evaluate to kvs ; 
(let ((person (list (. name "Alice") (. age 30) (. city "New York"))))
  (assoc 'age person))