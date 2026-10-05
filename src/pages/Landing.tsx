import { Link } from "react-router-dom";
import { LogIn } from "lucide-react";
import logo from "@/assets/logo.png";
import { FileRunners } from "@/components/FileRunners";

const Landing = () => (
  <div className="min-h-screen flex flex-col bg-white text-[#1a1a1a] overflow-x-clip">
    <header className="flex items-center justify-between gap-6 px-4 sm:px-8 py-5 max-w-[1400px] w-full mx-auto">
      <div className="flex items-center gap-2.5">
        <img src={logo} alt="Rottas Drive" className="w-7 h-7 object-contain shrink-0" />
        <span className="text-base font-semibold">Rottas Drive</span>
      </div>
      <Link
        to="/auth"
        className="h-9 flex items-center gap-2 px-4 rounded-[10px] bg-[#f29f05] hover:bg-[#e0930a] text-white text-sm font-semibold transition-colors"
      >
        <LogIn className="h-4 w-4" />
        Acessar
      </Link>
    </header>

    <main className="flex-1 grid grid-cols-[repeat(auto-fit,minmax(min(340px,100%),1fr))] items-center gap-14 max-w-[1400px] w-full mx-auto px-4 sm:px-8 pt-6 pb-[72px]">
      <div className="min-w-0 flex flex-col gap-7">
        <h1 className="m-0 text-[clamp(38px,4.4vw,62px)] leading-[1.04] tracking-[-.025em] font-bold">
          Seus arquivos,
          <br />
          <span className="text-[#f29f05]">num só lugar.</span>
        </h1>
        <p className="m-0 max-w-[500px] text-lg leading-[1.55] text-[#64748b] [text-wrap:pretty]">
          Vídeos, fotos, tabelas e apresentações sempre à mão para o time.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link
            to="/auth"
            className="h-12 flex items-center gap-2.5 px-6 rounded-[10px] bg-[#f29f05] hover:bg-[#e0930a] text-white text-base font-semibold transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Acessar
          </Link>
        </div>
        <div className="text-sm text-[#64748b]">Já tem conta? Login com e-mail corporativo Rottas.</div>
      </div>

      <div className="min-w-0 flex justify-center">
        <FileRunners />
      </div>
    </main>
  </div>
);

export default Landing;
