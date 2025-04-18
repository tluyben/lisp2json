
;; some trial stuff 

(type mult2 int -> int)
(defun mult2 (x) (* x 2))

;; x = y  // means now x owns y 
;; x = &y // means we have an immutable reference
;; x = &mut y // means we  have a mutable reference ?

;; (type y int -> int)
;; (type y int) ? 
(setq y 10)

(let ((x (mut y)))
    (+ x 1))
    
(let ((x (ref y)))
    (+ x 1))

(let ((x y))
    (+ x 1))
