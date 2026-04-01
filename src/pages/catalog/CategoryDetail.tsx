import { useParams } from 'react-router-dom'

export default function CategoryDetail() {
  const { id } = useParams()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Category Detail</h1>
      <p className="text-gray-500 mb-4">Route: /catalog/categories/{id}</p>
      <p className="text-gray-600">Edit category properties, manage subcategories, and view associated products.</p>
      <div className="mt-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <p className="text-sm text-gray-400">Category detail view placeholder — implementation pending</p>
      </div>
    </div>
  )
}
