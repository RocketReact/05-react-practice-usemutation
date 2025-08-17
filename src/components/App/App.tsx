import css from "./App.module.css";
import movieService from "../../services/movieService.ts";
import { useEffect, useState } from "react";
import SearchBar from "../SearchBar/SearchBar.tsx";
import { toast, Toaster } from "react-hot-toast";
import type { Movie } from "../../types/movie.ts";
import MovieGrid from "../MovieGrid/MovieGrid.tsx";
import Loader from "../Loader/Loader.tsx";
import ErrorMessage from "../ErrorMessage/ErrorMessage.tsx";
import MovieModal from "../MovieModal/MovieModal.tsx";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import axios from "axios";

interface handleCreateTodoProps {
  title: string;
  completed: boolean;
}

export default function App() {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await axios.get("https://jsonplaceholder.typicode.com/todos");
      return res.data;
    },
  });
  const mutation = useMutation<
    handleCreateTodoProps,
    Error,
    handleCreateTodoProps
  >({
    mutationFn: async (newTodo: handleCreateTodoProps) => {
      const res = await axios.post(
        "https://jsonplaceholder.typicode.com/todos",
        newTodo,
      );
      return res.data;
    },
    onError: (error: Error | null) => {
      console.log(error);
    },
    onSuccess: (data: handleCreateTodoProps) => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
      return data;
    },
  });

  const handleCreateTodo = () => {
    mutation.mutate({
      title: "New todo nigga",
      completed: false,
    });
  };
  const handleMovieSelect = (movie: Movie) => {
    setMovie(movie);
  };
  const handleCloseModal = () => {
    setMovie(null);
  };

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["movies", query, page],
    queryFn: async () => await movieService(query, page),
    enabled: query !== "",
    placeholderData: keepPreviousData,
  });
  const handleSearch = (query: string): void => {
    setQuery(query);
  };
  useEffect(() => {
    if (isSuccess && data?.results.length === 0) {
      toast.error("No movies found for your request.\n");
      setPage(1);
    }
  }, [data, isSuccess]);
  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />
      {isSuccess && data?.results.length > 1 && (
        <ReactPaginate
          pageCount={data.total_pages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      <button onClick={handleCreateTodo} className={css.createTodo}>
        Create Todo
      </button>
      {mutation.isPending && <div className={css.centered}>Adding todo...</div>}
      {mutation.isError && (
        <div className={css.centered}>An error occurred </div>
      )}
      {mutation.isSuccess && (
        <div className={css.centered}>Todo successfully added</div>
      )}

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {isSuccess && data?.results.length > 0 && (
        <MovieGrid movies={data.results} onSelect={handleMovieSelect} />
      )}
      {movie && <MovieModal movie={movie} onClose={handleCloseModal} />}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fffdfd",
            color: "#1e1d1d",
            cursor: "pointer",
          },
        }}
      />
    </div>
  );
}
