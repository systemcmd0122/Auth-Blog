'use client'

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle } from "lucide-react"

interface FormErrorProps {
  message?: string
}

const FormError = ({ message }: FormErrorProps) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-red-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-red-600"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div>{message}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FormError