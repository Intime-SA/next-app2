import { TrakeoData } from "@/app/lib/definitions";

interface TrakeoDataComponentProps {
  trakeoData: TrakeoData[];
}

const TrakeoDataComponent: React.FC<TrakeoDataComponentProps> = ({
  trakeoData,
}) => {
  return (
    <ul role="list" className="divide-y divide-gray-100">
      {trakeoData.map((trakeo) => (
        <li key={trakeo.id} className="flex justify-between gap-x-6 py-5">
          <div className="flex min-w-0 gap-x-4">
            <img
              alt="User Avatar"
              src="https://via.placeholder.com/150" // Puedes reemplazar esto con una URL dinámica si tienes imágenes de usuarios
              className="h-12 w-12 flex-none rounded-full bg-gray-50"
            />
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {trakeo.platform} {/* Ejemplo: plataforma o dispositivo */}
              </p>
              <br />
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                {trakeo.userAgent} {/* Ejemplo: User Agent */}
              </p>
              <br />
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                {trakeo.ip} {/* Ejemplo: Dirección IP */}
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm leading-6 text-gray-900">
              {trakeo.location} {/* Ejemplo: Ubicación */}
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Última actividad:{" "}
              <time dateTime={trakeo.dateTime}>{trakeo.dateTime}</time>
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TrakeoDataComponent;
