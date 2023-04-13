/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  purge:{
    safelist:["bg-red-100","text-red-800","bg-orange-100","text-orange-800","bg-yellow-100","text-yellow-800","bg-gray-100","text-gray-800"]
  },
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
