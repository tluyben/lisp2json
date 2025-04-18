(defun main ()
  ;; create a mutable variable
  (let ((s1 (mut "hello")))
    ;; create a mutable reference to s1        
    (let ((s2 (ref s1)))   
      ;; this is allowed        
      (setf s2 (concat s2 " world")) 
      (print s2))      
    ;; now s2 is out of scope, so this is allowed too                 
    (print s1)))                    