
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

;; get in the background, no blocking
(bg (fetch "https://xxx.com" :method :get))

;; block until we have the result 
(setq result (bg (fetch "https://xxx.com" :method :get) :block :all))
;; blocks until here 
(print "hello")
(print result)

;; block until if we use the result 
(setq result (bg (fetch "https://xxx.com" :method :get) :block))
(print "hello")
;; blocks until here 
(print result)

;; block until if we use the result 
(setq result (bg (fetch "https://xxx.com" :method :get) :block :retry 3))
(print "hello")
;; blocks until here if result or out of retries (with the error)
(print result)

;; event driven with the same api 
(setq result (bg (fetch "https://xxx.com" :method :get) :block :retry 3 :event))
;; runs this when it's done
(on result '(lambda (x) (print x))) 
;; but continues immediately here
(print "hello")

