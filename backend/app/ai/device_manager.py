import torch

class DeviceManager:
    def __init__(self):
        self.has_cuda = torch.cuda.is_available()
        if self.has_cuda:
            self.device_type = "CUDA_GPU"
            self.device_name = torch.cuda.get_device_name(0)
        else:
            self.device_type = "CPU"
            self.device_name = "Standard Local CPU Engine"

    def get_device_info(self):
        return {
            "ai_device": self.device_type,
            "device_name": self.device_name,
            "has_cuda": self.has_cuda
        }

device_manager = DeviceManager()
